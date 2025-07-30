import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { Card } from "../../components/Card";
import { Header } from "../../components/Header";
import { databaseManager } from "../../utils/database";
import { calculateHealthGoals } from "../../utils/healthGoals";
import { Stretch, stretches } from "../../utils/stretches";
import { useUserData } from "../../utils/UserContext";

const { width: screenWidth } = Dimensions.get("window");

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

export default function ProgressScreen() {
  // Exercise state (from habit)
  const [selectedStretch, setSelectedStretch] = useState<Stretch>(stretches[4]); // Default to "Forward Bend"
  const [exerciseDropdownVisible, setExerciseDropdownVisible] = useState(false);

  // Goals state (from stats)
  const [currentStreak, setCurrentStreak] = useState(0);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(new Date().getDay());
  const [currentDay, setCurrentDay] = useState(new Date().getDay());
  const [selectedWeek, setSelectedWeek] = useState(0);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editGoalTitle, setEditGoalTitle] = useState("");
  const [editGoalType, setEditGoalType] = useState<"boolean" | "numeric">(
    "boolean"
  );
  const [editGoalUnit, setEditGoalUnit] = useState("");
  const [editGoalValue, setEditGoalValue] = useState("");
  const [addGoalModalVisible, setAddGoalModalVisible] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState("");
  const [newGoalType, setNewGoalType] = useState<"boolean" | "numeric">(
    "boolean"
  );
  const [newGoalUnit, setNewGoalUnit] = useState("");
  const [newGoalValue, setNewGoalValue] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Stretch info modal state
  const [stretchInfoModalVisible, setStretchInfoModalVisible] = useState(false);
  const [selectedStretchForInfo, setSelectedStretchForInfo] =
    useState<Stretch | null>(null);

  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { userData, getAge } = useUserData();

  const weekDays = ["S", "M", "T", "W", "T", "F", "S"];

  const getYouTubeEmbedUrl = (videoId: string) => {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=1&showinfo=0&rel=0`;
  };

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

      await databaseManager.initialize();

      const { sleepHours: targetSleep, calories: targetCalories } =
        calculateHealthGoals(getAge(), userData.sex);

      const dateGoals = await databaseManager.getGoalsForDate(selectedDate);
      const formattedGoals = dateGoals.map((goal: any) => {
        let value = goal.completionValue || goal.value;
        let displayTitle = goal.title;

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

  const selectStretch = (stretch: Stretch) => {
    setSelectedStretch(stretch);
    setExerciseDropdownVisible(false);
  };

  const toggleGoal = async (goalId: string) => {
    try {
      const goal = goals.find((g) => g.id?.toString() === goalId);
      if (!goal || !goal.id) return;

      const newCompleted = !goal.completed;

      await databaseManager.updateGoalCompletionForDate(
        goal.id,
        selectedDate,
        newCompleted,
        goal.type === "numeric" ? goal.value : undefined
      );

      setGoals((prev) =>
        prev.map((g) =>
          g.id?.toString() === goalId ? { ...g, completed: newCompleted } : g
        )
      );

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

  // Function to check if a goal is stretch-related
  const isStretchGoal = (goalTitle: string): boolean => {
    const goalLower = goalTitle.toLowerCase();

    // Check if it matches any stretch name from our stretches.ts file
    const matchesStretchName = stretches.some((stretch) => {
      const stretchNameLower = stretch.name.toLowerCase();
      return (
        goalLower.includes(stretchNameLower) ||
        stretchNameLower.includes(goalLower) ||
        goalLower.includes(stretchNameLower.replace(/['s]/g, "")) ||
        stretchNameLower.replace(/['s]/g, "").includes(goalLower)
      );
    });

    return matchesStretchName;
  };

  // Function to find matching stretch for a goal
  const findMatchingStretch = (goalTitle: string): Stretch | null => {
    const goalLower = goalTitle.toLowerCase();

    // First, try exact or partial name matching
    const exactMatch = stretches.find((stretch) => {
      const stretchNameLower = stretch.name.toLowerCase();
      return (
        goalLower.includes(stretchNameLower) ||
        stretchNameLower.includes(goalLower)
      );
    });

    if (exactMatch) return exactMatch;

    // If no exact match, try matching without apostrophes and 's
    const normalizedMatch = stretches.find((stretch) => {
      const stretchNameLower = stretch.name.toLowerCase();
      const normalizedStretchName = stretchNameLower.replace(/['s]/g, "");
      const normalizedGoal = goalLower.replace(/['s]/g, "");

      return (
        normalizedGoal.includes(normalizedStretchName) ||
        normalizedStretchName.includes(normalizedGoal)
      );
    });

    if (normalizedMatch) return normalizedMatch;

    // If still no match, try keyword-based matching
    const keywordMatch = stretches.find((stretch) => {
      const stretchNameLower = stretch.name.toLowerCase();
      const stretchWords = stretchNameLower.split(/\s+/);

      return stretchWords.some(
        (word) => goalLower.includes(word) && word.length > 2
      );
    });

    return keywordMatch || null;
  };

  // Function to open stretch info modal
  const openStretchInfo = (goalTitle: string) => {
    const matchingStretch = findMatchingStretch(goalTitle);
    if (matchingStretch) {
      setSelectedStretchForInfo(matchingStretch);
      setStretchInfoModalVisible(true);
    }
  };

  const formatSelectedDate = (): string => {
    const date = new Date(selectedDate + "T00:00:00");
    const today = new Date().toISOString().split("T")[0];

    if (selectedDate === today) {
      return "Today's Progress";
    } else {
      return date.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  if (isLoading && goals.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        {/* Streak and Tasks Cards */}
        <View style={styles.cardsSection}>
          <Card
            label="Streak"
            value={currentStreak.toString()}
            subtext="days 🔥"
          />

          <Card
            label="Tasks Completed"
            value={`${goals.filter((goal) => goal.completed).length}/${
              goals.length
            }`}
            subtext="completed"
          />
        </View>

        {/* Day Selector */}
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

        {/* Goals Section */}
        <View style={styles.goalsSection}>
          <Text style={styles.sectionTitle}>Daily Goals</Text>
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

              <TouchableOpacity
                style={styles.goalContent}
                onPress={() => toggleGoal(goal.id?.toString() || "")}
              >
                <Text style={styles.goalTitle}>{goal.title}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.editButton}
                onPress={() => openEditModal(goal)}
              >
                <Ionicons name="create-outline" size={20} color="#9ACD32" />
              </TouchableOpacity>

              {/* Info button for stretch-related goals */}
              {isStretchGoal(goal.title) && (
                <TouchableOpacity
                  style={styles.infoButton}
                  onPress={() => openStretchInfo(goal.title)}
                >
                  <Ionicons
                    name="information-circle-outline"
                    size={20}
                    color="#9ACD32"
                  />
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
            </View>
          ))}
        </View>

        {/* Add Goal Button */}
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={openAddGoalModal}
        >
          <Text style={styles.addTaskText}>Add Goal</Text>
        </TouchableOpacity>
      </Animated.ScrollView>

      {/* Exercise Dropdown Modal */}
      <Modal
        visible={exerciseDropdownVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setExerciseDropdownVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setExerciseDropdownVisible(false)}
          activeOpacity={1}
        >
          <TouchableOpacity
            style={styles.dropdownModal}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.modalTitle}>Exercises</Text>
            <ScrollView style={styles.dropdownModalContent}>
              {stretches.map((stretch, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.dropdownItem}
                  onPress={() => selectStretch(stretch)}
                >
                  <Text style={styles.dropdownEmoji}>{stretch.emoji}</Text>
                  <View style={styles.dropdownMainArea}>
                    <Text style={styles.dropdownItemText}>{stretch.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Edit Goal Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
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

      {/* Stretch Info Modal */}
      <Modal
        visible={stretchInfoModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setStretchInfoModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.stretchInfoModal}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setStretchInfoModalVisible(false)}
            >
              <Ionicons name="close" size={24} color="#fff" />
            </TouchableOpacity>

            {selectedStretchForInfo && (
              <>
                <View style={styles.stretchHeader}>
                  <Text style={styles.stretchEmoji}>
                    {selectedStretchForInfo.emoji}
                  </Text>
                  <Text style={styles.stretchTitle}>
                    {selectedStretchForInfo.name}
                  </Text>
                </View>

                {/* Video */}
                <View style={styles.stretchVideoContainer}>
                  <WebView
                    source={{
                      uri: getYouTubeEmbedUrl(selectedStretchForInfo.youtubeId),
                    }}
                    style={styles.stretchWebView}
                    allowsFullscreenVideo={true}
                    mediaPlaybackRequiresUserAction={false}
                    javaScriptEnabled={true}
                    domStorageEnabled={true}
                    startInLoadingState={true}
                    scalesPageToFit={true}
                  />
                </View>

                {/* Instructions */}
                <View style={styles.stretchInstructionsContainer}>
                  <Text style={styles.stretchSectionTitle}>Instructions</Text>
                  {selectedStretchForInfo.description.map((step, index) => (
                    <Text key={index} style={styles.stretchInstructionStep}>
                      {index + 1}. {step}
                    </Text>
                  ))}
                </View>

                {/* Details */}
                <View style={styles.stretchDetailsContainer}>
                  <Text style={styles.stretchSectionTitle}>Details</Text>
                  <View style={styles.stretchDetailRow}>
                    <Text style={styles.stretchDetailLabel}>Targets:</Text>
                    <Text style={styles.stretchDetailValue}>
                      {selectedStretchForInfo.targets}
                    </Text>
                  </View>
                  <View style={styles.stretchDetailRow}>
                    <Text style={styles.stretchDetailLabel}>Duration:</Text>
                    <Text style={styles.stretchDetailValue}>
                      {selectedStretchForInfo.durationSeconds}s
                    </Text>
                  </View>
                  <View style={styles.stretchDetailRow}>
                    <Text style={styles.stretchDetailLabel}>Sets:</Text>
                    <Text style={styles.stretchDetailValue}>
                      {selectedStretchForInfo.sets}
                    </Text>
                  </View>
                </View>
              </>
            )}
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
    paddingHorizontal: 20,
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
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "#111",
    marginBottom: 20,
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
  exerciseSection: {
    marginBottom: 30,
  },
  exerciseDropdown: {
    backgroundColor: "#111",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#111",
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  exerciseText: {
    color: "#fff",
    fontSize: 14,
    flex: 1,
  },
  currentExercise: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  exerciseTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginRight: 10,
  },
  exerciseEmoji: {
    fontSize: 20,
  },
  videoContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 15,
  },
  webView: {
    flex: 1,
  },
  instructionsContainer: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 8,
  },
  instructionStep: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  goalsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    color: "#9ACD32",
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
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
    marginBottom: 20,
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
  dropdownModal: {
    backgroundColor: "#111",
    borderRadius: 12,
    width: "90%",
    height: "70%",
    marginHorizontal: 20,
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#111",
  },
  dropdownEmoji: {
    fontSize: 24,
    width: 30,
  },
  dropdownMainArea: {
    flex: 1,
  },
  dropdownItemText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  dropdownModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  weekContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  weekButton: {
    padding: 10,
  },
  weekText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  infoButton: {
    padding: 8,
    marginLeft: 10,
  },
  stretchInfoModal: {
    backgroundColor: "#111",
    borderRadius: 12,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 6,
  },
  stretchHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  stretchEmoji: {
    fontSize: 30,
    marginRight: 10,
  },
  stretchTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  stretchVideoContainer: {
    height: 200,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#000",
    marginBottom: 15,
    width: "100%",
  },
  stretchWebView: {
    flex: 1,
  },
  stretchInstructionsContainer: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 8,
    width: "100%",
  },
  stretchSectionTitle: {
    color: "#9ACD32",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 10,
  },
  stretchInstructionStep: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  stretchDetailsContainer: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    width: "100%",
  },
  stretchDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  stretchDetailLabel: {
    color: "#9ACD32",
    fontSize: 14,
    fontWeight: "500",
  },
  stretchDetailValue: {
    color: "#fff",
    fontSize: 14,
  },
  cardsSection: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 0,
    marginBottom: 16,
    alignItems: "stretch",
  },
});
