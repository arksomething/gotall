import * as SQLite from 'expo-sqlite';
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

class DatabaseManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async initializeDatabase(): Promise<void> {
    try {
      this.db = await SQLite.openDatabaseAsync('gotall.db');
      
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
        
        CREATE INDEX IF NOT EXISTS idx_date ON daily_logs(date);
        CREATE INDEX IF NOT EXISTS idx_goal_completions_date ON goal_completions(date);
        CREATE INDEX IF NOT EXISTS idx_goal_completions_goal_id ON goal_completions(goal_id);
        CREATE INDEX IF NOT EXISTS idx_daily_goals_date ON daily_goals(date);
      `);

      // Insert default goals if none exist
      await this.insertDefaultGoals();
    } catch (error) {
      console.error('Error initializing database:', error);
      throw error;
    }
  }

  async insertDefaultGoals(): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      const now = new Date().toISOString();
      
      // Only insert static goals that appear every day
      const existingStaticGoals = await this.db!.getAllAsync('SELECT COUNT(*) as count FROM goals WHERE active = 1') as any[];
      
      if (existingStaticGoals[0].count === 0) {
        const staticGoals = [
          { title: 'Hours slept', icon: 'moon', type: 'numeric', unit: 'hrs' },
          { title: 'Calorie Goal', icon: 'fitness', type: 'numeric', unit: 'kcals' }
        ];

        for (const goal of staticGoals) {
          await this.db!.runAsync(
            `INSERT INTO goals (title, icon, type, unit, active, created_at, updated_at)
             VALUES (?, ?, ?, ?, 1, ?, ?)`,
            [goal.title, goal.icon, goal.type, goal.unit || null, now, now]
          );
        }
        console.log('Inserted static goals');
      }
    } catch (error) {
      console.error('Error inserting default goals:', error);
    }
  }

  // Method to clean up duplicate goals
  async cleanupDuplicateGoals(): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Remove duplicate goals, keeping only the first occurrence of each title
      await this.db!.runAsync(`
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Delete all static goals and their completions
      await this.db!.runAsync('DELETE FROM goal_completions WHERE goal_id IN (SELECT id FROM goals WHERE active = 1)');
      await this.db!.runAsync('DELETE FROM goals WHERE active = 1');
      
      console.log('Cleared all static goals');
    } catch (error) {
      console.error('Error clearing static goals:', error);
    }
  }

  // Method to completely purge all goals and start fresh
  async purgeAllGoals(): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Delete everything - all goals, completions, and daily goals
      await this.db!.runAsync('DELETE FROM goal_completions');
      await this.db!.runAsync('DELETE FROM daily_goals');
      await this.db!.runAsync('DELETE FROM goals');
      
      console.log('Purged all goals, completions, and daily goals');
    } catch (error) {
      console.error('Error purging all goals:', error);
    }
  }

  async generateDailyGoals(date: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      const now = new Date().toISOString();
      
      // Check if daily goals already exist for this date
      const existingDailyGoals = await this.db!.getAllAsync(
        'SELECT COUNT(*) as count FROM daily_goals WHERE date = ?',
        [date]
      ) as any[];
      
      // Only generate if no daily goals exist for this date
      if (existingDailyGoals[0].count === 0) {
        // Pick one random stretch
        const randomStretch = stretches[Math.floor(Math.random() * stretches.length)];
        
        // Pick one random task
        const randomTask = dailyTasks[Math.floor(Math.random() * dailyTasks.length)];
        
        console.log(`Selected stretch: ${randomStretch.name}`);
        console.log(`Selected task: ${randomTask.name}`);
        
        // Insert stretch as a goal
        const stretchResult = await this.db!.runAsync(
          `INSERT INTO goals (title, icon, type, unit, active, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, ?, ?)`,
          [randomStretch.name, randomStretch.emoji, 'boolean', null, now, now]
        );
        
        // Insert task as a goal
        const taskResult = await this.db!.runAsync(
          `INSERT INTO goals (title, icon, type, unit, active, created_at, updated_at)
           VALUES (?, ?, ?, ?, 0, ?, ?)`,
          [randomTask.name, randomTask.emoji, 'boolean', randomTask.duration, now, now]
        );
        
        // Link them to this specific date
        await this.db!.runAsync(
          'INSERT INTO daily_goals (date, goal_id, created_at) VALUES (?, ?, ?)',
          [date, stretchResult.lastInsertRowId, now]
        );
        
        await this.db!.runAsync(
          'INSERT INTO daily_goals (date, goal_id, created_at) VALUES (?, ?, ?)',
          [date, taskResult.lastInsertRowId, now]
        );
        
        console.log(`Daily goals generated for ${date}: ${randomStretch.name} + ${randomTask.name}`);
      } else {
        console.log(`Daily goals already exist for ${date}`);
      }
    } catch (error) {
      console.error('Error generating daily goals:', error);
    }
  }

  async getGoalsForToday(): Promise<(Goal & { completed: boolean; completionValue?: string })[]> {
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    
    try {
      // Generate daily goals for today if they don't exist
      await this.generateDailyGoals(today);
      
      // Get static goals (always active) and daily goals for today
      const results = await this.db!.getAllAsync(`
        SELECT 
          g.*,
          COALESCE(gc.completed, 0) as completed,
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
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    try {
      await this.db!.runAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Generate daily goals for the specified date if they don't exist
      await this.generateDailyGoals(date);
      
      // Get static goals (always active) and daily goals for the specified date
      const results = await this.db!.getAllAsync(`
        SELECT 
          g.*,
          COALESCE(gc.completed, 0) as completed,
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
      console.error('Error getting goals for date:', error);
      return [];
    }
  }

  async updateGoalCompletionForDate(goalId: number, date: string, completed: boolean, value?: string): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    const now = new Date().toISOString();
    
    try {
      await this.db!.runAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      await this.db!.runAsync('DELETE FROM daily_goals WHERE date = ?', [date]);
      console.log(`Cleared daily goals for ${date}`);
    } catch (error) {
      console.error('Error clearing daily goals:', error);
    }
  }

  // Testing method to check what goals exist in database
  async debugGoalsInDatabase(): Promise<void> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      const allGoals = await this.db!.getAllAsync('SELECT id, title, active FROM goals ORDER BY active DESC, title') as any[];
      console.log('All goals in database:');
      allGoals.forEach(goal => {
        console.log(`  ${goal.id}: ${goal.title} (active: ${goal.active})`);
      });
      
      const dailyGoalsToday = await this.db!.getAllAsync('SELECT * FROM daily_goals WHERE date = ?', [new Date().toISOString().split('T')[0]]) as any[];
      console.log('Daily goals for today:', dailyGoalsToday);
      
      // Check stretch count vs database
      console.log(`Stretches in data: ${stretches.length}`);
      console.log(`Tasks in data: ${dailyTasks.length}`);
      
      const stretchesInDb = await this.db!.getAllAsync(
        `SELECT COUNT(*) as count FROM goals WHERE title IN (${stretches.map(() => '?').join(',')})`,
        stretches.map(s => s.name)
      ) as any[];
      
      const tasksInDb = await this.db!.getAllAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Clear existing daily goals for this date
      await this.db!.runAsync('DELETE FROM daily_goals WHERE date = ?', [date]);
      console.log(`Cleared existing daily goals for ${date}`);
      
      // Force regenerate
      await this.generateDailyGoals(date);
      console.log(`Forced regeneration complete for ${date}`);
      
    } catch (error) {
      console.error('Error force regenerating daily goals:', error);
    }
  }

  async getStreakCount(): Promise<number> {
    if (!this.db) await this.initializeDatabase();
    
    try {
      // Get all completion dates ordered by date descending
      const results = await this.db!.getAllAsync(`
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
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    
    try {
      const result = await this.db!.getFirstAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    
    try {
      // Try to update existing record first
      const result = await this.db!.runAsync(
        `UPDATE daily_logs 
         SET sleep_hours = ?, updated_at = ?
         WHERE date = ?`,
        [sleepHours, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await this.db!.runAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const tasksJson = JSON.stringify(tasksCompleted);
    
    try {
      // Try to update existing record first
      const result = await this.db!.runAsync(
        `UPDATE daily_logs 
         SET tasks_completed = ?, updated_at = ?
         WHERE date = ?`,
        [tasksJson, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await this.db!.runAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    const tasksJson = JSON.stringify(tasksCompleted);
    
    try {
      // Try to update existing record first
      const result = await this.db!.runAsync(
        `UPDATE daily_logs 
         SET sleep_hours = ?, tasks_completed = ?, updated_at = ?
         WHERE date = ?`,
        [sleepHours, tasksJson, now, today]
      );

      // If no record was updated, create a new one
      if (result.changes === 0) {
        await this.db!.runAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      const results = await this.db!.getAllAsync(
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
    if (!this.db) await this.initializeDatabase();
    
    try {
      const results = await this.db!.getAllAsync(
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
}

// Export singleton instance
export const databaseManager = new DatabaseManager(); 