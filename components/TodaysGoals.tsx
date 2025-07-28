import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { databaseManager } from "../utils/database";
import { calculateHealthGoals } from "../utils/healthGoals";
import { useUserData } from "../utils/UserContext";

interface Goal {
  id?: number;
  title: string;
  icon: string;
  value?: string;
  unit?: string;
  completed: boolean;
  type: "boolean" | "numeric";
  completionValue?: string;
  displayTitle?: string;
}

interface TodaysGoalsProps {
  onCalorieGoalPress?: (goal: Goal) => void;
}

export const TodaysGoals: React.FC<TodaysGoalsProps> = ({
  onCalorieGoalPress,
}) => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const { userData, getAge } = useUserData();

  useEffect(() => {
    loadTodaysData();
  }, [userData]); // Reload when user data changes

  const loadTodaysData = async () => {
    try {
      // Initialize database first
      await databaseManager.initialize();

      // Calculate current health goals
      const { sleepHours: targetSleep, calories: targetCalories } =
        calculateHealthGoals(getAge(), userData.sex);

      // Load goals for today (this will automatically generate random daily goals if needed)
      const todaysGoals = await databaseManager.getGoalsForToday();
      const formattedGoals = todaysGoals.map((goal: any) => {
        let value = goal.completionValue || goal.value;
        let displayTitle = goal.title;

        // Update values and display titles based on latest calculations
        if (goal.title === "Sleep Goal") {
          value = targetSleep.toString();
          displayTitle = `Sleep Goal - ${targetSleep} hours`;
        } else if (goal.title === "Calorie Goal") {
          value = targetCalories.toString();
          displayTitle = `Calorie Goal - ${targetCalories} kcal`;
        }

        return {
          id: goal.id,
          title: goal.title, // Keep original title for database operations
          displayTitle, // Add display title for UI
          icon: goal.icon,
          value,
          unit: goal.unit,
          completed: goal.completed,
          type: goal.type,
          completionValue: goal.completionValue,
        };
      });

      setGoals(formattedGoals);

      // Set sleep hours from the sleep goal
      const sleepGoal = formattedGoals.find(
        (goal: Goal) => goal.title === "Sleep Goal"
      );
      if (sleepGoal && sleepGoal.completionValue) {
        setSleepHours(parseFloat(sleepGoal.completionValue));
      } else if (sleepGoal && sleepGoal.value) {
        setSleepHours(parseFloat(sleepGoal.value));
      }
    } catch (error) {
      console.error("Error loading today's data:", error);
    }
  };

  const handleSleepChange = async (increment: boolean) => {
    let newSleepHours: number;

    if (sleepHours === null) {
      // Use calculated sleep goal as default
      const { sleepHours: targetSleep } = calculateHealthGoals(
        getAge(),
        userData.sex
      );
      newSleepHours = targetSleep;
    } else {
      newSleepHours = increment ? sleepHours + 0.5 : sleepHours - 0.5;
      newSleepHours = Math.max(0, Math.min(24, newSleepHours));
    }

    setSleepHours(newSleepHours);

    // Update the sleep goal in the goals system
    const sleepGoal = goals.find((goal) => goal.title === "Sleep Goal");
    if (sleepGoal && sleepGoal.id) {
      try {
        await databaseManager.updateGoalCompletion(
          sleepGoal.id,
          true,
          newSleepHours.toString()
        );
        // Update local state without reloading all data
        setGoals((prev) =>
          prev.map((goal) =>
            goal.title === "Sleep Goal"
              ? {
                  ...goal,
                  completed: true,
                  value: newSleepHours.toString(),
                  completionValue: newSleepHours.toString(),
                }
              : goal
          )
        );
      } catch (error) {
        console.error("Failed to save sleep hours to database:", error);
      }
    }
  };

  const toggleTask = async (goalId: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      // If it's the calorie goal, trigger the callback instead of toggling
      if (goal.title === "Calorie Goal") {
        onCalorieGoalPress?.(goal);
        return;
      }

      const newCompleted = !goal.completed;

      // Update in database
      await databaseManager.updateGoalCompletion(
        goalId,
        newCompleted,
        goal.type === "numeric" ? goal.value : undefined
      );

      // Update local state
      setGoals((prev) =>
        prev.map((g) =>
          g.id === goalId ? { ...g, completed: newCompleted } : g
        )
      );
    } catch (error) {
      console.error("Error toggling goal:", error);
    }
  };

  // Filter goals to show boolean tasks and calorie goal in the daily tasks section
  const dailyTasks = goals.filter(
    (goal) => goal.type === "boolean" || goal.title === "Calorie Goal"
  );

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Today's Goals</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statsGrid}>
          {/* Sleep Card */}
          <View style={styles.sleepCard}>
            <Ionicons
              name="moon"
              size={20}
              color="#fff"
              style={styles.sleepIcon}
            />
            <View style={styles.sleepPicker}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => handleSleepChange(false)}
              >
                <Ionicons name="remove" size={16} color="#9ACD32" />
              </TouchableOpacity>

              <Text style={styles.sleepLabel}>
                {sleepHours !== null ? `${sleepHours} hrs` : "Select"}
              </Text>

              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => handleSleepChange(true)}
              >
                <Ionicons name="add" size={16} color="#9ACD32" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Daily Tasks Card */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>Daily Tasks</Text>
            <View style={styles.tasksContainer}>
              {dailyTasks.map((task) => (
                <TouchableOpacity
                  key={task.id}
                  style={styles.taskRow}
                  onPress={() => task.id && toggleTask(task.id)}
                >
                  {task.type === "boolean" ? (
                    // Boolean task with checkbox
                    <>
                      <View
                        style={[
                          styles.taskCheckbox,
                          task.completed && styles.taskCompleted,
                        ]}
                      >
                        {task.completed && (
                          <Ionicons name="checkmark" size={14} color="#000" />
                        )}
                      </View>
                      <Text
                        style={[
                          styles.taskText,
                          task.completed && styles.taskTextCompleted,
                        ]}
                      >
                        {task.displayTitle || task.title}
                      </Text>
                    </>
                  ) : (
                    // Numeric task with value display
                    <>
                      <Ionicons
                        name="fitness"
                        size={18}
                        color="#000"
                        style={styles.taskIcon}
                      />
                      <Text style={styles.taskText}>
                        {task.displayTitle || task.title}
                      </Text>
                      <Text style={styles.taskValue}>
                        {task.value || task.completionValue || "0"} {task.unit}
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
  },
  statsContainer: {
  },
  statsGrid: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 12,
    flexDirection: "column",
    gap: 8,
    width: "100%",
  },
  sleepCard: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    alignItems: "center",
    minHeight: 70,
    justifyContent: "center",
  },
  sleepIcon: {
    marginBottom: 5,
  },
  sleepPicker: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    paddingHorizontal: 10,
  },
  stepperButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: "#9ACD32",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(154, 205, 50, 0.1)",
  },
  sleepLabel: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "bold",
    minWidth: 50,
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "#9ACD32",
    borderRadius: 8,
    padding: 12,
    width: "100%",
  },
  statsTitle: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  tasksContainer: {
    flexDirection: "column",
    gap: 8,
  },
  taskRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  taskCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: "#000",
    borderRadius: 4,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  taskCompleted: {
    backgroundColor: "#000",
    borderColor: "#000",
  },
  taskText: {
    color: "#000",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  taskTextCompleted: {
    textDecorationLine: "line-through",
    opacity: 0.6,
  },
  taskIcon: {
    marginRight: 10,
  },
  taskValue: {
    color: "#000",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: "auto",
  },
});
