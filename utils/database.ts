import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import { stretches } from './stretches';
import { dailyTasks } from './tasks';

export interface DailyLog {
  id?: number;
  date: string; // YYYY-MM-DD format
  sleepHours?: number;
  tasksCompleted: string; // JSON string of boolean array
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id?: number;
  title: string;
  icon: string;
  value?: string;
  unit?: string;
  type: 'boolean' | 'numeric';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoalCompletion {
  id?: number;
  goalId: number;
  date: string; // YYYY-MM-DD format
  completed: boolean;
  value?: string;
  createdAt: string;
}

export interface DailyGoal {
  id?: number;
  date: string; // YYYY-MM-DD format
  goalId: number;
  createdAt: string;
}

export class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  async initialize(): Promise<void> {
    // If already initialized, return immediately
    if (this.db) return;

    // If initialization is in progress, wait for it
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Start new initialization
    this.initializationPromise = this._initialize();
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private async _initialize(): Promise<void> {
    if (this.isInitializing) {
      // Wait a bit and try again
      await new Promise(resolve => setTimeout(resolve, 100));
      return this.initialize();
    }

    try {
      this.isInitializing = true;
      
      if (Platform.OS === 'android') {
        const dbDirectory = `${FileSystem.documentDirectory}SQLite`;
        
        // Ensure directory exists with proper permissions
        try {
          const dirInfo = await FileSystem.getInfoAsync(dbDirectory);
          if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dbDirectory, { intermediates: true });
          }
        } catch (error) {
          console.error('Error creating database directory:', error);
          throw new Error('Failed to create database directory');
        }

        // Ensure we have write permissions
        try {
          const testFile = `${dbDirectory}/test.txt`;
          await FileSystem.writeAsStringAsync(testFile, 'test');
          await FileSystem.deleteAsync(testFile, { idempotent: true });
        } catch (error) {
          console.error('Error testing directory permissions:', error);
          throw new Error('No write permission for database directory');
        }
      }

      // Close any existing connection
      if (this.db) {
        try {
          await this.db.closeAsync();
        } catch (error) {
          console.warn('Error closing existing database connection:', error);
        }
        this.db = null;
      }

      // Open database with retries
      let retries = 3;
      while (retries > 0) {
        try {
          this.db = await SQLite.openDatabaseAsync('gotall.db');
          break;
        } catch (error) {
          console.warn(`Failed to open database, retries left: ${retries - 1}`, error);
          retries--;
          if (retries === 0) throw error;
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      if (!this.db) {
        throw new Error('Failed to open database after retries');
      }

      // Create tables
      await this.db.execAsync(`
        CREATE TABLE IF NOT EXISTS daily_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT UNIQUE NOT NULL,
          sleep_hours REAL,
          tasks_completed TEXT NOT NULL DEFAULT '[]',
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          icon TEXT NOT NULL,
          value TEXT,
          unit TEXT,
          type TEXT NOT NULL CHECK (type IN ('boolean', 'numeric')),
          active BOOLEAN NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL,
          updated_at TEXT NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS goal_completions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          goal_id INTEGER NOT NULL,
          date TEXT NOT NULL,
          completed BOOLEAN NOT NULL DEFAULT 0,
          value TEXT,
          created_at TEXT NOT NULL,
          FOREIGN KEY (goal_id) REFERENCES goals (id),
          UNIQUE(goal_id, date)
        );
        
        CREATE TABLE IF NOT EXISTS daily_goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          date TEXT NOT NULL,
          goal_id INTEGER NOT NULL,
          created_at TEXT NOT NULL,
          FOREIGN KEY (goal_id) REFERENCES goals (id),
          UNIQUE(date, goal_id)
        );
      `);

      await this.db.execAsync(`
        CREATE INDEX IF NOT EXISTS idx_date ON daily_logs(date);
        CREATE INDEX IF NOT EXISTS idx_goal_completions_date ON goal_completions(date);
        CREATE INDEX IF NOT EXISTS idx_goal_completions_goal_id ON goal_completions(goal_id);
        CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(date);
      `);

      // Insert default goals if none exist
      await this.insertDefaultGoals();
      
    } catch (error) {
      console.error('Error initializing database:', error);
      this.db = null;
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  private async getDb(): Promise<SQLite.SQLiteDatabase> {
    if (!this.db) {
      await this.initialize();
      if (!this.db) {
        throw new Error('Database not initialized');
      }
    }
    return this.db;
  }

  async insertDefaultGoals(): Promise<void> {
    const db = await this.getDb();
    
    try {
      const now = new Date().toISOString();
      
      // Only insert static goals that appear every day
      const existingStaticGoals = await db.getAllAsync('SELECT COUNT(*) as count FROM goals WHERE active = 1') as any[];
      
      if (existingStaticGoals[0].count === 0) {
        // Use default values for initial goals
        // These will be updated dynamically when displayed
        const staticGoals = [
          { title: 'Sleep Goal', icon: 'moon', type: 'numeric', unit: 'hrs', value: '8' },
          { title: 'Calorie Goal', icon: 'fitness', type: 'numeric', unit: 'kcals', value: '2000' }
        ];

        for (const goal of staticGoals) {
          await db.runAsync(
            `INSERT INTO goals (title, icon, type, unit, value, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
            [goal.title, goal.icon, goal.type, goal.unit, goal.value, now, now]
          );
        }
        console.log('Inserted static goals');
      }
    } catch (error) {
      console.error('Error inserting default goals:', error);
      throw error;
    }
  }

  // Method to clean up duplicate goals
  async cleanupDuplicateGoals(): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Remove duplicate goals, keeping only the first occurrence of each title
      await db.runAsync(`
        DELETE FROM goals 
        WHERE id NOT IN (
          SELECT MIN(id) 
          FROM goals 
          GROUP BY title
        )
      `);
      
      console.log('Cleaned up duplicate goals');
    } catch (error) {
      console.error('Error cleaning up duplicate goals:', error);
    }
  }

  // Method to clear all static goals (active = 1)
  async clearStaticGoals(): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Delete all static goals and their completions
      await db.runAsync('DELETE FROM goal_completions WHERE goal_id IN (SELECT id FROM goals WHERE active = 1)');
      await db.runAsync('DELETE FROM goals WHERE active = 1');
      
      console.log('Cleared all static goals');
    } catch (error) {
      console.error('Error clearing static goals:', error);
    }
  }

  // Method to completely purge all goals and start fresh
  async purgeAllGoals(): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Delete everything - all goals, completions, and daily goals
      await db.runAsync('DELETE FROM goal_completions');
      await db.runAsync('DELETE FROM daily_goals');
      await db.runAsync('DELETE FROM goals');
      
      console.log('Purged all goals, completions, and daily goals');
    } catch (error) {
      console.error('Error purging all goals:', error);
    }
  }

  async generateDailyGoals(date: string): Promise<void> {
    const db = await this.getDb();
    const now = new Date().toISOString();

    try {
      // First check if we already have ANY goals for this date
      const existingGoals = await db.getAllAsync(
        'SELECT COUNT(*) as count FROM daily_goals WHERE date = ?',
        [date]
      ) as any[];

      // If we already have goals for this date, don't generate more
      if (existingGoals[0].count > 0) {
        console.log(`Daily goals already exist for ${date}, skipping generation`);
        return;
      }

      // Pick one random stretch
      const randomStretch = stretches[Math.floor(Math.random() * stretches.length)];
      
      // Pick one random task
      const randomTask = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
      
      console.log(`Selected stretch: ${randomStretch.name}`);
      console.log(`Selected task: ${randomTask.name}`);
      
      // Insert stretch as a goal
      const stretchResult = await db.runAsync(
        `INSERT INTO goals (title, icon, type, unit, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [randomStretch.name, randomStretch.emoji, 'boolean', null, now, now]
      );
      
      // Insert task as a goal
      const taskResult = await db.runAsync(
        `INSERT INTO goals (title, icon, type, unit, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, 0, ?, ?)`,
        [randomTask.name, randomTask.emoji, 'boolean', randomTask.duration, now, now]
      );
      
      // Link them to this specific date
      await db.runAsync(
        'INSERT INTO daily_goals (date, goal_id, created_at) VALUES (?, ?, ?)',
        [date, stretchResult.lastInsertRowId, now]
      );
      
      await db.runAsync(
        'INSERT INTO daily_goals (date, goal_id, created_at) VALUES (?, ?, ?)',
        [date, taskResult.lastInsertRowId, now]
      );
      
      console.log(`Daily goals generated for ${date}: ${randomStretch.name} + ${randomTask.name}`);
    } catch (error) {
      console.error('Error generating daily goals:', error);
    }
  }

  async getGoalsForToday(): Promise<(Goal & { completed: boolean; completionValue?: string })[]> {
    const db = await this.getDb();
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Ensure static goals exist
      const staticCountResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM goals WHERE active = 1'
      ) as any;
      if (staticCountResult.count === 0) {
        await this.insertDefaultGoals();
      }

      // First check if we have any goals for today
      const existingGoals = await db.getAllAsync(
        'SELECT COUNT(*) as count FROM daily_goals WHERE date = ?',
        [today]
      ) as any[];

      // Only generate if we have no goals at all for today
      if (existingGoals[0].count === 0) {
        await this.generateDailyGoals(today);
      }

      // Get all goals for today (both static and daily)
      const results = await db.getAllAsync(`
        SELECT 
          g.*,
          gc.completed,
          gc.value as completion_value
        FROM goals g
        LEFT JOIN goal_completions gc ON g.id = gc.goal_id AND gc.date = ?
        WHERE g.active = 1 
        OR g.id IN (SELECT goal_id FROM daily_goals WHERE date = ?)
        ORDER BY g.active DESC, g.id
      `, [today, today]) as any[];

      return results.map(result => ({
        id: result.id,
        title: result.title,
        icon: result.icon,
        value: result.value,
        unit: result.unit,
        type: result.type as 'boolean' | 'numeric',
        active: result.active,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        completed: Boolean(result.completed),
        completionValue: result.completion_value
      }));
    } catch (error) {
      console.error('Error getting goals for today:', error);
      return [];
    }
  }

  async updateGoalCompletion(goalId: number, completed: boolean, value?: string): Promise<void> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO goal_completions (goal_id, date, completed, value, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [goalId, today, completed ? 1 : 0, value || null, now]
      );
    } catch (error) {
      console.error('Error updating goal completion:', error);
      throw error;
    }
  }

  async getGoalsForDate(date: string): Promise<(Goal & { completed: boolean; completionValue?: string })[]> {
    const db = await this.getDb();
    
    try {
      // Ensure static goals exist
      const staticCountResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM goals WHERE active = 1'
      ) as any;
      if (staticCountResult.count === 0) {
        await this.insertDefaultGoals();
      }

      // Generate daily goals for the requested date if missing
      const dailyCountResult = await db.getFirstAsync(
        'SELECT COUNT(*) as count FROM daily_goals WHERE date = ?',
        [date]
      ) as any;
      if (dailyCountResult.count === 0) {
        await this.generateDailyGoals(date);
      }

      // Get all goals for the specified date (both static and daily)
      const results = await db.getAllAsync(`
        SELECT 
          g.*,
          gc.completed,
          gc.value as completion_value
        FROM goals g
        LEFT JOIN goal_completions gc ON g.id = gc.goal_id AND gc.date = ?
        WHERE g.active = 1 
        OR g.id IN (SELECT goal_id FROM daily_goals WHERE date = ?)
        ORDER BY g.active DESC, g.id
      `, [date, date]) as any[];

      return results.map(result => ({
        id: result.id,
        title: result.title,
        icon: result.icon,
        value: result.completionValue || result.value,
        unit: result.unit,
        type: result.type as 'boolean' | 'numeric',
        active: result.active,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        completed: Boolean(result.completed),
        completionValue: result.completion_value
      }));
    } catch (error) {
      console.error('Error getting goals for date:', error);
      return [];
    }
  }

  async updateGoalCompletionForDate(goalId: number, date: string, completed: boolean, value?: string): Promise<void> {
    const db = await this.getDb();
    
    const now = new Date().toISOString();
    
    try {
      await db.runAsync(
        `INSERT OR REPLACE INTO goal_completions (goal_id, date, completed, value, created_at)
         VALUES (?, ?, ?, ?, ?)`,
        [goalId, date, completed ? 1 : 0, value || null, now]
      );
    } catch (error) {
      console.error('Error updating goal completion for date:', error);
      throw error;
    }
  }

  // Testing method to clear daily goals for a specific date
  async clearDailyGoalsForDate(date: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      await db.runAsync('DELETE FROM daily_goals WHERE date = ?', [date]);
      console.log(`Cleared daily goals for ${date}`);
    } catch (error) {
      console.error('Error clearing daily goals:', error);
    }
  }

  // Testing method to check what goals exist in database
  async debugGoalsInDatabase(): Promise<void> {
    const db = await this.getDb();
    
    try {
      const allGoals = await db.getAllAsync('SELECT id, title, active FROM goals ORDER BY active DESC, title') as any[];
      console.log('All goals in database:');
      allGoals.forEach(goal => {
        console.log(`  ${goal.id}: ${goal.title} (active: ${goal.active})`);
      });
      
      const dailyGoalsToday = await db.getAllAsync('SELECT * FROM daily_goals WHERE date = ?', [new Date().toISOString().split('T')[0]]) as any[];
      console.log('Daily goals for today:', dailyGoalsToday);
      
      // Check stretch count vs database
      console.log(`Stretches in data: ${stretches.length}`);
      console.log(`Tasks in data: ${dailyTasks.length}`);
      
      const stretchesInDb = await db.getAllAsync(
        `SELECT COUNT(*) as count FROM goals WHERE title IN (${stretches.map(() => '?').join(',')})`,
        stretches.map(s => s.name)
      ) as any[];
      
      const tasksInDb = await db.getAllAsync(
        `SELECT COUNT(*) as count FROM goals WHERE title IN (${dailyTasks.map(() => '?').join(',')})`,
        dailyTasks.map(t => t.name)
      ) as any[];
      
      console.log(`Stretches in DB: ${stretchesInDb[0].count}`);
      console.log(`Tasks in DB: ${tasksInDb[0].count}`);
      
    } catch (error) {
      console.error('Error debugging goals:', error);
    }
  }

  // Force regenerate daily goals for testing
  async forceRegenerateDailyGoals(date: string): Promise<void> {
    const db = await this.getDb();
    
    try {
      // Clear existing daily goals for this date
      await db.runAsync('DELETE FROM daily_goals WHERE date = ?', [date]);
      console.log(`Cleared existing daily goals for ${date}`);
      
      // Force regenerate
      await this.generateDailyGoals(date);
      console.log(`Forced regeneration complete for ${date}`);
      
    } catch (error) {
      console.error('Error force regenerating daily goals:', error);
    }
  }

  async getStreakCount(): Promise<number> {
    const db = await this.getDb();
    
    try {
      // Get all completion dates ordered by date descending
      const results = await db.getAllAsync(`
        SELECT DISTINCT date 
        FROM goal_completions 
        WHERE completed = 1
        ORDER BY date DESC
      `) as any[];

      if (results.length === 0) return 0;

      let streak = 0;
      const today = new Date();
      
      for (let i = 0; i < results.length; i++) {
        const completionDate = new Date(results[i].date + 'T00:00:00');
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);
        
        // Check if this completion date matches the expected consecutive date
        if (completionDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }
      
      return streak;
    } catch (error) {
      console.error('Error getting streak count:', error);
      return 0;
    }
  }

  async getTodaysLog(): Promise<DailyLog | null> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM daily_logs WHERE date = ?',
        [today]
      ) as any;

      if (result) {
        return {
          id: result.id,
          date: result.date,
          sleepHours: result.sleep_hours,
          tasksCompleted: result.tasks_completed,
          createdAt: result.created_at,
          updatedAt: result.updated_at,
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting today\'s log:', error);
      return null;
    }
  }

  async updateSleepHours(sleepHours: number): Promise<void> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    try {
      // Try to update existing record first
      const result = await db.runAsync(
        `UPDATE daily_logs 
         SET sleep_hours = ?, updated_at = ?
         WHERE date = ?`,
        [sleepHours, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await db.runAsync(
          `INSERT INTO daily_logs (date, sleep_hours, tasks_completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [today, sleepHours, '[]', now, now]
        );
      }
    } catch (error) {
      console.error('Error updating sleep hours:', error);
      throw error;
    }
  }

  async updateTasksCompleted(tasksCompleted: boolean[]): Promise<void> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const tasksJson = JSON.stringify(tasksCompleted);
    
    try {
      // Try to update existing record first
      const result = await db.runAsync(
        `UPDATE daily_logs 
         SET tasks_completed = ?, updated_at = ?
         WHERE date = ?`,
        [tasksJson, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await db.runAsync(
          `INSERT INTO daily_logs (date, sleep_hours, tasks_completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [today, null, tasksJson, now, now]
        );
      }
    } catch (error) {
      console.error('Error updating tasks completed:', error);
      throw error;
    }
  }

  async updateBothSleepAndTasks(sleepHours: number, tasksCompleted: boolean[]): Promise<void> {
    const db = await this.getDb();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const tasksJson = JSON.stringify(tasksCompleted);
    
    try {
      // Try to update existing record first
      const result = await db.runAsync(
        `UPDATE daily_logs 
         SET sleep_hours = ?, tasks_completed = ?, updated_at = ?
         WHERE date = ?`,
        [sleepHours, tasksJson, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await db.runAsync(
          `INSERT INTO daily_logs (date, sleep_hours, tasks_completed, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?)`,
          [today, sleepHours, tasksJson, now, now]
        );
      }
    } catch (error) {
      console.error('Error updating both sleep and tasks:', error);
      throw error;
    }
  }

  async getAllLogs(): Promise<DailyLog[]> {
    const db = await this.getDb();
    
    try {
      const results = await db.getAllAsync(
        'SELECT * FROM daily_logs ORDER BY date DESC'
      ) as any[];

      return results.map(result => ({
        id: result.id,
        date: result.date,
        sleepHours: result.sleep_hours,
        tasksCompleted: result.tasks_completed,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }));
    } catch (error) {
      console.error('Error getting all logs:', error);
      return [];
    }
  }

  async getLogsByDateRange(startDate: string, endDate: string): Promise<DailyLog[]> {
    const db = await this.getDb();
    
    try {
      const results = await db.getAllAsync(
        'SELECT * FROM daily_logs WHERE date BETWEEN ? AND ? ORDER BY date DESC',
        [startDate, endDate]
      ) as any[];

      return results.map(result => ({
        id: result.id,
        date: result.date,
        sleepHours: result.sleep_hours,
        tasksCompleted: result.tasks_completed,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
      }));
    } catch (error) {
      console.error('Error getting logs by date range:', error);
      return [];
    }
  }

  async getUserData(): Promise<any> {
    const db = await this.getDb();
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM user_data WHERE id = 1'
      ) as any;
      return result || {};
    } catch (error) {
      console.error('Error getting user data:', error);
      return {};
    }
  }

  async getHeightPredictions(): Promise<any> {
    const db = await this.getDb();
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM height_predictions WHERE id = 1'
      ) as any;
      return result || {};
    } catch (error) {
      console.error('Error getting height predictions:', error);
      return {};
    }
  }

  async getCalorieData(date: string): Promise<any> {
    const db = await this.getDb();
    try {
      const result = await db.getFirstAsync(
        'SELECT * FROM calorie_data WHERE date = ?',
        [date]
      ) as any;
      return result || {};
    } catch (error) {
      console.error('Error getting calorie data:', error);
      return {};
    }
  }

  async createGoal(title: string, icon: string, type: 'boolean' | 'numeric', unit?: string, value?: string): Promise<number> {
    const db = await this.getDb();

    const now = new Date().toISOString();

    try {
      const result = await db.runAsync(
        `INSERT INTO goals (title, icon, type, unit, value, active, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
        [title, icon, type, unit || null, value || null, now, now]
      );
      return result.lastInsertRowId as number;
    } catch (error) {
      console.error('Error creating goal:', error);
      throw error;
    }
  }

  // Update an existing goal's metadata
  async updateGoal(goalId: number, title: string, type: 'boolean' | 'numeric', unit?: string, value?: string): Promise<void> {
    const db = await this.getDb();

    const now = new Date().toISOString();

    try {
      await db.runAsync(
        `UPDATE goals SET title = ?, type = ?, unit = ?, value = ?, updated_at = ? WHERE id = ?`,
        [title, type, unit || null, value || null, now, goalId]
      );
    } catch (error) {
      console.error('Error updating goal:', error);
      throw error;
    }
  }

  // Delete a goal and associated records
  async deleteGoal(goalId: number): Promise<void> {
    const db = await this.getDb();

    try {
      // Remove dependent records first because of FK constraints
      await db.runAsync('DELETE FROM goal_completions WHERE goal_id = ?', [goalId]);
      await db.runAsync('DELETE FROM daily_goals WHERE goal_id = ?', [goalId]);
      await db.runAsync('DELETE FROM goals WHERE id = ?', [goalId]);
    } catch (error) {
      console.error('Error deleting goal:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
export const databaseManager = new DatabaseManager();

// Initialize the database when this module is imported
databaseManager.initialize().catch(error => {
  console.error('Failed to initialize database:', error);
}); 