import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Modal,
  SafeAreaView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/Header";
import { databaseManager } from "../../utils/database";
import { calculateHealthGoals } from "../../utils/healthGoals";
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

export default function StatsScreen() {
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalType, setEditGoalType] = useState<"boolean" | "numeric">(
    "boolean"
  );
  const [editGoalUnit, setEditGoalUnit] = useState("");
  const [editGoalValue, setEditGoalValue] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [tempValue, setTempValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData, getAge } = useUserData();
  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<"boolean" | "numeric">(
    "boolean"
  );
  const [newGoalUnit, setNewGoalUnit] = useState("");
  const [newGoalValue, setNewGoalValue] = useState("");

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];
  const currentDay = new Date().getDay();

  const fadeOut = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  };

  const fadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

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
      fadeOut();
      setIsLoading(true);

      // Initialize database
      await databaseManager.initialize();

      // Calculate current health goals
      const { sleepHours: targetSleep, calories: targetCalories } =
        calculateHealthGoals(getAge(), userData.sex);

      // Load goals for the selected date
      const dateGoals = await databaseManager.getGoalsForDate(selectedDate);
      const formattedGoals = dateGoals.map((goal: any) => {
        let value = goal.completionValue || goal.value;
        let displayTitle = goal.title;

        // Update values based on latest calculations
        if (goal.title === "Sleep Goal") {
          value = value || targetSleep.toString();
        } else if (goal.title === "Calorie Goal") {
          value = value || targetCalories.toString();
        }

        return {
          id: goal.id,
          title: displayTitle,
          icon: goal.icon,
          value,
          unit: goal.unit,
          completed: goal.completed,
          type: goal.type,
          completionValue: goal.completionValue,
        };
      });

      setGoals(formattedGoals);

      // Load streak count
      const streak = await databaseManager.getStreakCount();
      setCurrentStreak(streak);
    } catch (error) {
      console.error("Error loading data:", error);
      Alert.alert("Error", "Failed to load goals data");
    } finally {
      setIsLoading(false);
      fadeIn();
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
    setEditingGoal(goal);
    setEditGoalTitle(goal.title);
    setEditGoalType(goal.type);
    setEditGoalUnit(goal.unit || "");
    setEditGoalValue(goal.value || "");
    setEditModalVisible(true);
  };

  const saveEditedGoal = async () => {
    if (!editingGoal || !editingGoal.id) return;

    if (!editGoalTitle.trim()) {
      Alert.alert("Validation", "Please enter a goal title");
      return;
    }

    if (
      editGoalType === "numeric" &&
      (!editGoalValue.trim() || !editGoalUnit.trim())
    ) {
      Alert.alert(
        "Validation",
        "Please enter both a target value and unit for numeric goals"
      );
      return;
    }

    try {
      await databaseManager.updateGoal(
        editingGoal.id!,
        editGoalTitle.trim(),
        editGoalType,
        editGoalType === "numeric" ? editGoalUnit.trim() : undefined,
        editGoalType === "numeric" ? editGoalValue.trim() : undefined
      );

      setEditModalVisible(false);
      await loadData();
    } catch (error) {
      console.error("Error updating goal:", error);
      Alert.alert("Error", "Failed to update goal");
    }
  };

  const handleDeleteGoal = async () => {
    if (!editingGoal || !editingGoal.id) return;
    Alert.alert("Delete Goal", "Are you sure you want to delete this goal?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await databaseManager.deleteGoal(editingGoal.id!);
            setEditModalVisible(false);
            await loadData();
          } catch (error) {
            console.error("Error deleting goal:", error);
            Alert.alert("Error", "Failed to delete goal");
          }
        },
      },
    ]);
  };

  const openAddGoalModal = () => {
    setNewGoalTitle("");
    setNewGoalType("boolean");
    setNewGoalUnit("");
    setNewGoalValue("");
    setAddGoalModalVisible(true);
  };

  const saveNewGoal = async () => {
    if (!newGoalTitle.trim()) {
      Alert.alert("Validation", "Please enter a goal title");
      return;
    }

    if (
      newGoalType === "numeric" &&
      (!newGoalValue.trim() || !newGoalUnit.trim())
    ) {
      Alert.alert(
        "Validation",
        "Please enter both a target value and unit for numeric goals"
      );
      return;
    }
    try {
      await databaseManager.createGoal(
        newGoalTitle.trim(),
        "checkmark",
        newGoalType,
        newGoalType === "numeric" ? newGoalUnit.trim() : undefined,
        newGoalType === "numeric" ? newGoalValue.trim() : undefined
      );
      setAddGoalModalVisible(false);
      await loadData();
    } catch (error) {
      console.error("Error creating goal:", error);
      Alert.alert("Error", "Failed to create goal");
    }
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

  if (isLoading && goals.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container]}>
      <Header
        title={formatSelectedDate()}
        showBackButton={false}
        rightElement={
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/profile")}
            style={{
              width: 32,
              height: 32,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons name="settings-outline" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <Animated.ScrollView
        style={[styles.content, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
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

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(goal)}
              >
                <Ionicons name="create-outline" size={20} color="#9ACD32" />
              </TouchableOpacity>

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

              {goal.type === "boolean" && <></>}
            </View>
          ))}
        </View>

        {/* Add Task Button */}
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={openAddGoalModal}
        >
          <Text style={styles.addTaskText}>Add Goal</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Edit Goal Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Delete icon */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteGoal}
            >
              <Ionicons name="trash-outline" size={20} color="#FF6666" />
            </TouchableOpacity>

            <Text style={styles.modalTitle}>Edit Goal</Text>

            <TextInput
              style={styles.modalInput}
              value={editGoalTitle}
              onChangeText={setEditGoalTitle}
              placeholder="Goal title"
              placeholderTextColor="#666"
            />

            {/* Numeric extras */}
            {editGoalType === "numeric" && (
              <View style={styles.compactInputRow}>
                <TextInput
                  style={[styles.modalInputCompact, { flex: 1 }]}
                  value={editGoalValue}
                  onChangeText={setEditGoalValue}
                  placeholder="Target"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInputCompact, { width: 80 }]}
                  value={editGoalUnit}
                  onChangeText={setEditGoalUnit}
                  placeholder="Unit"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            {/* Type Switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Numeric goal</Text>
              <Switch
                value={editGoalType === "numeric"}
                onValueChange={(val) =>
                  setEditGoalType(val ? "numeric" : "boolean")
                }
                trackColor={{ false: "#666", true: "#9ACD32" }}
                thumbColor={editGoalType === "numeric" ? "#000" : "#fff"}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setEditModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={saveEditedGoal}
              >
                <Text style={styles.modalButtonTextPrimary}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        visible={addGoalModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAddGoalModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Goal</Text>
            <TextInput
              style={styles.modalInput}
              value={newGoalTitle}
              onChangeText={setNewGoalTitle}
              placeholder="Goal title"
              placeholderTextColor="#666"
            />

            {/* Numeric goal extra fields */}
            {newGoalType === "numeric" && (
              <View style={styles.compactInputRow}>
                <TextInput
                  style={[styles.modalInputCompact, { flex: 1 }]}
                  value={newGoalValue}
                  onChangeText={setNewGoalValue}
                  placeholder="Target"
                  placeholderTextColor="#666"
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.modalInputCompact, { width: 80 }]}
                  value={newGoalUnit}
                  onChangeText={setNewGoalUnit}
                  placeholder="Unit"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            {/* Goal Type Switch */}
            <View style={styles.switchRow}>
              <Text style={styles.switchLabel}>Numeric goal</Text>
              <Switch
                value={newGoalType === "numeric"}
                onValueChange={(val) =>
                  setNewGoalType(val ? "numeric" : "boolean")
                }
                trackColor={{ false: "#666", true: "#9ACD32" }}
                thumbColor={newGoalType === "numeric" ? "#000" : "#fff"}
              />
            </View>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setAddGoalModalVisible(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={saveNewGoal}
              >
                <Text style={styles.modalButtonTextPrimary}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 2,
    borderBottomColor: "#111",
    marginBottom: 30,
    width: "100%",
  },
  dayContainer: {
    alignItems: "center",
    justifyContent: "center",
    width: 45,
    height: 45,
    paddingVertical: 8,
  },
  dayText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
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
    height: 3,
    backgroundColor: "#9ACD32",
    borderRadius: 1,
    marginTop: 4,
  },
  goalsSection: {
    marginBottom: 30,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#111",
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
    backgroundColor: "#111",
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
    backgroundColor: "#111",
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
    backgroundColor: "#111",
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
  typeSelection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  typeButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "#111",
  },
  typeButtonSelected: {
    backgroundColor: "#9ACD32",
  },
  typeButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  typeButtonTextSelected: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  switchLabel: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
  compactInputRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
  },
  modalInputCompact: {
    backgroundColor: "#111",
    borderRadius: 8,
    padding: 12,
    color: "#fff",
    fontSize: 16,
  },
  deleteButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
  },
});
