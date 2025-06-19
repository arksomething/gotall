import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Graph from "../../components/Graph";
import { Header } from "../../components/Header";
import { CalorieModal } from "../../components/modals/CalorieModal";
import { HeightModal } from "../../components/modals/HeightModal";
import { WeightModal } from "../../components/modals/WeightModal";
import { databaseManager } from "../../utils/database";
import { getHeightForInput } from "../../utils/heightUtils";
import { useUserData } from "../../utils/UserContext";

interface Goal {
  id?: number;
  title: string;
  icon: string;
  value?: string;
  unit?: string;
  completed: boolean;
  type: "boolean" | "numeric";
  completionValue?: string;
}

export default function Index() {
  const {
    userData,
    updateUserData,
    getAge,
    getDisplayHeight,
    getDisplayWeight,
  } = useUserData();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [sleepHours, setSleepHours] = useState<number | null>(null);
  const [calorieModalVisible, setCalorieModalVisible] = useState(false);
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [heightModalVisible, setHeightModalVisible] = useState(false);
  const [tempCalorieValue, setTempCalorieValue] = useState("");
  const [tempWeightValue, setTempWeightValue] = useState("");
  const [tempHeightValue, setTempHeightValue] = useState("");

  // Get live data from UserContext
  const userAge = getAge();
  const userAgeInMonths = userAge * 12;

  const handleSleepChange = async (increment: boolean) => {
    let newSleepHours: number;

    if (sleepHours === null) {
      newSleepHours = 8; // Set to 8 on first interaction
    } else {
      newSleepHours = increment ? sleepHours + 0.5 : sleepHours - 0.5;
      newSleepHours = Math.max(0, Math.min(24, newSleepHours));
    }

    setSleepHours(newSleepHours);

    // Update the sleep goal in the goals system
    const sleepGoal = goals.find((goal) => goal.title === "Hours slept");
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
            goal.title === "Hours slept"
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

  useEffect(() => {
    loadTodaysData();
  }, []);

  const loadTodaysData = async () => {
    try {
      // Initialize database first
      await databaseManager.initializeDatabase();

      // Load goals for today (this will automatically generate random daily goals if needed)
      const todaysGoals = await databaseManager.getGoalsForToday();
      const formattedGoals = todaysGoals.map((goal: any) => ({
        id: goal.id,
        title: goal.title,
        icon: goal.icon,
        value: goal.completionValue || goal.value,
        unit: goal.unit,
        completed: goal.completed,
        type: goal.type,
        completionValue: goal.completionValue,
      }));

      setGoals(formattedGoals);

      // Set sleep hours from the sleep goal
      const sleepGoal = formattedGoals.find(
        (goal: Goal) => goal.title === "Hours slept"
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

  const toggleTask = async (goalId: number) => {
    try {
      const goal = goals.find((g) => g.id === goalId);
      if (!goal) return;

      // If it's the calorie goal, open the modal instead of toggling
      if (goal.title === "Calorie Goal") {
        openCalorieModal(goal);
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

  const openCalorieModal = (goal: Goal) => {
    setTempCalorieValue(goal.value || goal.completionValue || "2000");
    setCalorieModalVisible(true);
  };

  const saveCalorieGoal = async (newCalorieValue: string) => {
    const calorieGoal = goals.find((goal) => goal.title === "Calorie Goal");
    if (!calorieGoal || !calorieGoal.id) return;

    const numericValue = parseInt(newCalorieValue);
    if (isNaN(numericValue) || numericValue <= 0) {
      Alert.alert("Invalid Input", "Please enter a valid number of calories.");
      return;
    }

    try {
      // Update in database
      await databaseManager.updateGoalCompletion(
        calorieGoal.id,
        true,
        newCalorieValue
      );

      // Update local state
      setGoals((prev) =>
        prev.map((goal) =>
          goal.title === "Calorie Goal"
            ? {
                ...goal,
                value: newCalorieValue,
                completed: true,
                completionValue: newCalorieValue,
              }
            : goal
        )
      );

      setCalorieModalVisible(false);
    } catch (error) {
      console.error("Error saving calorie goal:", error);
      Alert.alert("Error", "Failed to save calorie goal");
    }
  };

  const openWeightModal = () => {
    setTempWeightValue(userData.weight.toString());
    setWeightModalVisible(true);
  };

  const openHeightModal = () => {
    // Set temp value using centralized utility
    setTempHeightValue(
      getHeightForInput(userData.heightCm, userData.preferredHeightUnit)
    );
    setHeightModalVisible(true);
  };

  // Debug function to completely purge and rebuild all goals
  const debugGoals = async () => {
    try {
      console.log("=== PURGING ALL GOALS ===");

      // Completely purge everything - all goals, completions, daily goals
      console.log("Purging all goals from database...");
      await databaseManager.purgeAllGoals();

      // Insert fresh static goals
      console.log("Inserting fresh static goals...");
      await databaseManager.insertDefaultGoals();

      // Generate today's daily goals (exactly 2: 1 stretch + 1 task)
      const today = new Date().toISOString().split("T")[0];
      console.log("Generating fresh daily goals...");
      await databaseManager.generateDailyGoals(today);

      await databaseManager.debugGoalsInDatabase();

      console.log("Reloading goals...");
      await loadTodaysData();

      console.log("=== COMPLETE RESET FINISHED ===");
    } catch (error) {
      console.error("Debug error:", error);
    }
  };

  // Filter goals to show boolean tasks and calorie goal in the daily tasks section
  const dailyTasks = goals.filter(
    (goal) => goal.type === "boolean" || goal.title === "Calorie Goal"
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Header title="Home" />
        {/* Stats Section */}
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
                  {sleepHours !== null ? `${sleepHours} hrs` : "N/A"}
                </Text>

                <TouchableOpacity
                  style={styles.stepperButton}
                  onPress={() => handleSleepChange(true)}
                >
                  <Ionicons name="add" size={16} color="#9ACD32" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Height/Weight Cards */}
            <View style={styles.smallCardsColumn}>
              <TouchableOpacity
                style={styles.smallCard}
                onPress={openHeightModal}
              >
                <Text style={styles.smallCardText}>{getDisplayHeight()}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.smallCard}
                onPress={openWeightModal}
              >
                <Text style={styles.smallCardText}>{getDisplayWeight()}</Text>
              </TouchableOpacity>
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
                          {task.title}
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
                        <Text style={styles.taskText}>{task.title}</Text>
                        <Text style={styles.taskValue}>
                          {task.value || task.completionValue || "0"}{" "}
                          {task.unit}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        </View>

        {/* Progress Section with Graph */}
        <View style={styles.progressSection}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressTitle}>Height Progress</Text>
            <Ionicons
              name="trending-up"
              size={16}
              color="#9ACD32"
              style={styles.progressIcon}
            />
          </View>

          {/* Height Percentile Graph */}
          <Graph
            sex={userData.sex}
            age={userAgeInMonths}
            currentHeight={userData.heightCm}
          />
        </View>
      </ScrollView>

      {/* Modals */}
      <CalorieModal
        visible={calorieModalVisible}
        onClose={() => setCalorieModalVisible(false)}
        onSave={saveCalorieGoal}
        initialValue={tempCalorieValue}
      />

      <WeightModal
        visible={weightModalVisible}
        onClose={() => setWeightModalVisible(false)}
        initialValue={tempWeightValue}
      />

      <HeightModal
        visible={heightModalVisible}
        onClose={() => setHeightModalVisible(false)}
        initialValue={tempHeightValue}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollView: {
    flex: 1,
  },
  statsContainer: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  statsGrid: {
    borderWidth: 2,
    borderColor: "#007AFF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  sleepCard: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 6,
    flex: 1,
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
  smallCardsColumn: {
    flex: 1,
    gap: 8,
    marginLeft: 8,
  },
  smallCard: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 6,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    minHeight: 30,
  },
  smallCardText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
  },
  statsCard: {
    backgroundColor: "#9ACD32",
    borderRadius: 8,
    padding: 12,
    width: "100%",
    marginTop: 8,
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
  progressSection: {
    paddingHorizontal: 20,
    marginTop: 30,
    flex: 1,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    paddingHorizontal: 0,
  },
  progressTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  progressIcon: {
    marginLeft: 8,
  },
  progressSubtext: {
    color: "#666",
    fontSize: 14,
  },
});
