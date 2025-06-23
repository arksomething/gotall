import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Header } from "../../components/Header";
import { databaseManager } from "../../utils/database";

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

export default function StatsScreen() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDay = new Date().getDay();

  useEffect(() => {
    loadData();
  }, [selectedDate]);

  // Add focus effect to reload data when tab is focused
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const getDateForDayIndex = (dayIndex: number): string => {
    const today = new Date();
    const currentDayIndex = today.getDay();
    const difference = dayIndex - currentDayIndex;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + difference);

    return targetDate.toISOString().split("T")[0];
  };

  const handleDayPress = (dayIndex: number) => {
    setSelectedDayIndex(dayIndex);
    const newDate = getDateForDayIndex(dayIndex);
    setSelectedDate(newDate);
  };

  const loadData = async () => {
    try {
      setIsLoading(true);

      // Initialize database
      await databaseManager.initializeDatabase();

      // Load goals for the selected date
      const dateGoals = await databaseManager.getGoalsForDate(selectedDate);
      const formattedGoals = dateGoals.map((goal: any) => ({
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

      // Load streak count
      const streak = await databaseManager.getStreakCount();
      setCurrentStreak(streak);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load goals data");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGoal = async (goalId: string) => {
    try {
      const goal = goals.find((g) => g.id?.toString() === goalId);
      if (!goal || !goal.id) return;

      const newCompleted = !goal.completed;

      // Update in database for the selected date
      await databaseManager.updateGoalCompletionForDate(
        goal.id,
        selectedDate,
        newCompleted,
        goal.type === "numeric" ? goal.value : undefined
      );

      // Update local state
      setGoals((prev) =>
        prev.map((g) =>
          g.id?.toString() === goalId ? { ...g, completed: newCompleted } : g
        )
      );

      // Reload streak count
      const newStreak = await databaseManager.getStreakCount();
      setCurrentStreak(newStreak);
    } catch (error) {
      console.error("Error toggling goal:", error);
      Alert.alert("Error", "Failed to update goal");
    }
  };

  const openEditModal = (goal: Goal) => {
    if (goal.type === "numeric") {
      setEditingGoal(goal);
      setTempValue(goal.value || "");
      setModalVisible(true);
    }
  };

  const saveGoalValue = async () => {
    if (!editingGoal || !editingGoal.id) return;

    try {
      // Update in database for the selected date
      await databaseManager.updateGoalCompletionForDate(
        editingGoal.id,
        selectedDate,
        true,
        tempValue
      );

      // Update local state
      setGoals((prev) =>
        prev.map((goal) =>
          goal.id === editingGoal.id
            ? {
                ...goal,
                value: tempValue,
                completed: true,
                completionValue: tempValue,
              }
            : goal
        )
      );

      // Reload streak count
      const newStreak = await databaseManager.getStreakCount();
      setCurrentStreak(newStreak);
    } catch (error) {
      console.error("Error saving goal value:", error);
      Alert.alert("Error", "Failed to save goal value");
    }

    setModalVisible(false);
    setEditingGoal(null);
    setTempValue("");
  };

  const getGoalIcon = (iconName: string) => {
    const iconMap: { [key: string]: any } = {
      body: "body",
      moon: "moon",
      fitness: "fitness",
      sunny: "sunny",
    };
    return iconMap[iconName] || "checkmark";
  };

  const formatSelectedDate = (): string => {
    const date = new Date(selectedDate + "T00:00:00");
    const today = new Date().toISOString().split("T")[0];

    if (selectedDate === today) {
      return "Today's Goals";
    } else {
      return (
        date.toLocaleDateString("en-US", {
          weekday: "long",
          month: "short",
          day: "numeric",
        }) + " Goals"
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title={formatSelectedDate()} showBackButton={false} />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Streak */}
        <View style={styles.streakSection}>
          <Text style={styles.streakText}>{currentStreak} day streak 🔥</Text>
        </View>

        {/* Week Days */}
        <View style={styles.weekSection}>
          {weekDays.map((day, index) => (
            <TouchableOpacity
              key={index}
              style={styles.dayContainer}
              onPress={() => handleDayPress(index)}
            >
              <Text
                style={[
                  styles.dayText,
                  index === currentDay && styles.currentDayText,
                  index === selectedDayIndex && styles.selectedDayText,
                ]}
              >
                {day}
              </Text>
              {index === selectedDayIndex && (
                <View style={styles.selectedDayIndicator} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals List */}
        <View style={styles.goalsSection}>
          {goals.map((goal) => (
            <View key={goal.id} style={styles.goalItem}>
              <TouchableOpacity
                style={styles.goalCheckbox}
                onPress={() => toggleGoal(goal.id?.toString() || "")}
              >
                <View
                  style={[
                    styles.checkbox,
                    goal.completed && styles.checkboxCompleted,
                  ]}
                >
                  {goal.completed && (
                    <Ionicons name="checkmark" size={16} color="#000" />
                  )}
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.goalContent}>
                <Text style={styles.goalTitle}>{goal.title}</Text>
              </TouchableOpacity>

              {goal.type === "numeric" && (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditModal(goal)}
                >
                  <Ionicons name="create-outline" size={20} color="#9ACD32" />
                </TouchableOpacity>
              )}

              {goal.type === "numeric" && goal.value && (
                <>
                  <TouchableOpacity style={styles.iconButton}>
                    <Ionicons
                      name={getGoalIcon(goal.icon)}
                      size={20}
                      color="#9ACD32"
                    />
                  </TouchableOpacity>
                  <Text style={styles.goalValue}>
                    {goal.value} {goal.unit}
                  </Text>
                </>
              )}

              {goal.type === "boolean" && (
                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="create-outline" size={20} color="#9ACD32" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Add Task Button */}
        <TouchableOpacity style={styles.addTaskButton}>
          <Text style={styles.addTaskText}>Add Task</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit {editingGoal?.title}</Text>
            <TextInput
              style={styles.modalInput}
              value={tempValue}
              onChangeText={setTempValue}
              placeholder="Enter value"
              placeholderTextColor="#666"
              keyboardType="numeric"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={saveGoalValue}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: "#9ACD32",
    fontSize: 16,
  },
  streakSection: {
    marginBottom: 20,
  },
  streakText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  weekSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    marginBottom: 30,
  },
  dayContainer: {
    alignItems: "center",
    padding: 8,
    minWidth: 40,
    minHeight: 40,
    justifyContent: "center",
  },
  dayText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
  },
  currentDayText: {
    color: "#9ACD32",
  },
  selectedDayText: {
    color: "#9ACD32",
    fontWeight: "bold",
  },
  selectedDayIndicator: {
    width: 20,
    height: 2,
    backgroundColor: "#9ACD32",
    borderRadius: 1,
    marginTop: 5,
  },
  goalsSection: {
    marginBottom: 30,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  goalCheckbox: {
    marginRight: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: "#666",
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxCompleted: {
    backgroundColor: "#9ACD32",
    borderColor: "#9ACD32",
  },
  goalContent: {
    flex: 1,
  },
  goalTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  editButton: {
    padding: 8,
    marginLeft: 10,
  },
  iconButton: {
    padding: 8,
    marginLeft: 10,
  },
  goalValue: {
    color: "#fff",
    fontSize: 14,
    marginLeft: 10,
    minWidth: 60,
    textAlign: "right",
  },
  addTaskButton: {
    backgroundColor: "#9ACD32",
    borderRadius: 25,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 30,
  },
  addTaskText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    padding: 20,
    width: "80%",
  },
  modalTitle: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  modalInput: {
    backgroundColor: "#333",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#333",
  },
  modalButtonPrimary: {
    backgroundColor: "#9ACD32",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  modalButtonTextPrimary: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});
