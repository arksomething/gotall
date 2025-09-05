import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as Localization from "expo-localization";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  LayoutAnimation,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  UIManager,
  View,
} from "react-native";
import { Header } from "../../components/Header";
import { logEvent } from "../../utils/Analytics";
import { databaseManager } from "../../utils/database";
import {
  calculateHeightProjection,
  calculatePercentile,
} from "../../utils/heightProjection";
import { getHeightForInput } from "../../utils/heightUtils";
import i18n from "../../utils/i18n";
import { useUserData } from "../../utils/UserContext";

type Message = {
  id: string;
  content: string;
  role: "user" | "assistant";
};

interface UserContext {
  currentHeight: number;
  predictedHeight: string;
  percentileInfo: any;
  weeklyGoals: any[];
  weeklyCalories: number;
  goalsCompleted: number;
  totalGoals: number;
  gender: "male" | "female";
  age: number;
  weight: number;
  ethnicity: string;
}

// Local list of i18n keys for suggested prompts
const SUGGESTED_PROMPT_KEYS: string[] = [
  "tabs:coach_prompt_how_tall",
  "tabs:coach_prompt_posture_stretches",
  "tabs:coach_prompt_sleep_hours",
  "tabs:coach_prompt_best_foods",
];

export default function CoachScreen() {
  const { userData, getAge, getDisplayHeight, getDisplayWeight } =
    useUserData();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userContext, setUserContext] = useState<UserContext | null>(null);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadUserContext();
  }, []);

  // Enable LayoutAnimation on Android
  useEffect(() => {
    if (
      Platform.OS === "android" &&
      UIManager.setLayoutAnimationEnabledExperimental
    ) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);

  const loadUserContext = async () => {
    try {
      const today = new Date().toISOString().split("T")[0];

      // Use context-provided user data
      const height = userData.heightCm;
      const weight = userData.weight;
      const age = getAge();
      const gender = userData.sex === "1" ? "male" : "female";

      // Get height predictions and percentiles
      const predictions = await databaseManager.getHeightPredictions();
      const percentileInfo = calculatePercentile(
        gender === "male" ? "1" : "2",
        age * 12,
        height
      );

      // Fallback projection if database does not have predicted height
      let predictedHeightString: string;
      if (predictions && predictions.adultHeight) {
        predictedHeightString = `${
          predictions.adultHeight
        }cm (${getHeightForInput(predictions.adultHeight, "ft")})`;
      } else {
        const projection = calculateHeightProjection({
          heightCm: height,
          age,
          sex: userData.sex,
          motherHeightCm: userData.motherHeightCm,
          fatherHeightCm: userData.fatherHeightCm,
        });
        predictedHeightString = projection.potentialHeight;
      }

      // Get weekly goals
      const weeklyGoals = await databaseManager.getGoalsForDate(today);
      const completedGoals = weeklyGoals.filter((g: any) => g.completed).length;

      // Get calorie data
      const calorieData = await databaseManager.getCalorieData(today);

      setUserContext({
        currentHeight: height,
        predictedHeight: predictedHeightString,
        percentileInfo,
        weeklyGoals,
        weeklyCalories: calorieData?.calories || 0,
        goalsCompleted: completedGoals,
        totalGoals: weeklyGoals.length,
        gender,
        age,
        weight,
        ethnicity: userData.ethnicity,
      });
    } catch (error) {
      console.error("Error loading user context:", error);
    }
  };

  const clearChat = () => {
    Alert.alert(
      i18n.t("tabs:coach_clear_chat_title"),
      i18n.t("tabs:coach_clear_chat_confirm"),
      [
        {
          text: i18n.t("tabs:cancel") || "Cancel",
          style: "cancel",
        },
        {
          text: i18n.t("tabs:delete") || "Clear",
          style: "destructive",
          onPress: () => {
            LayoutAnimation.easeInEaseOut();
            setMessages([]);
          },
        },
      ]
    );
  };

  const sendMessage = async (contentOverride?: string) => {
    const content = (contentOverride ?? inputText).trim();
    if (!content || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      content,
      role: "user" as const,
    };

    // Animate messages appearing
    LayoutAnimation.easeInEaseOut();
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    try {
      logEvent("ai_coach_request", {
        locale: Localization.getLocales()?.[0]?.languageTag || "en",
        hasUserContext: !!userContext,
        messageLength: userMessage.content.length,
      });
      const contextPayload = userContext
        ? {
            currentHeight: `${userContext.currentHeight}cm (${getHeightForInput(
              userContext.currentHeight,
              "ft"
            )})`,
            predictedAdultHeight: userContext.predictedHeight,
            percentile: userContext.percentileInfo?.range || "Unknown",
            weeklyGoalsProgress: `${userContext.goalsCompleted}/${userContext.totalGoals} goals completed`,
            dailyCalories: `${userContext.weeklyCalories} calories today`,
            gender: userContext.gender,
            age: `${userContext.age} years old`,
            weight: `${userContext.weight}kg`,
            ethnicity: userData.ethnicity,
            preferredHeightUnit: userData.preferredHeightUnit,
            preferredWeightUnit: userData.preferredWeightUnit,
            displayHeight: getDisplayHeight(),
            displayWeight: getDisplayWeight(),
            weeklyGoals: userContext.weeklyGoals.map((g: any) => ({
              title: g.title,
              completed: g.completed,
              value: g.value,
              unit: g.unit,
            })),
          }
        : undefined;

      const response = await fetch(
        "https://heightcoach-2og6xa3ima-uc.a.run.app",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-App-Locale": Localization.getLocales()?.[0]?.languageTag || "en",
          },
          body: JSON.stringify({
            messages: [
              ...messages,
              { role: "user", content: userMessage.content },
            ].map(({ role, content }) => ({ role, content })),
            userData: contextPayload,
          }),
        }
      );

      const data = await response.json();

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        content: data.reply,
        role: "assistant" as const,
      };

      logEvent("ai_coach_success", {
        locale: Localization.getLocales()?.[0]?.languageTag || "en",
        hasUserContext: !!userContext,
        promptTokensApprox: messages.length + 1,
      });

      // Haptic feedback when a response arrives
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate messages appearing
      LayoutAnimation.easeInEaseOut();
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      logEvent("ai_coach_error", {
        locale: Localization.getLocales()?.[0]?.languageTag || "en",
        hasUserContext: !!userContext,
        messageLength: userMessage.content.length,
        error: String(error),
      });
      // Add error message to chat
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        content: i18n.t("tabs:coach_error_reply"),
        role: "assistant" as const,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for suggested prompt chips
  const handleSuggestedPrompt = (prompt: string) => {
    // Directly send without extra tap
    sendMessage(prompt);
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageBubble,
        item.role === "user" ? styles.userBubble : styles.assistantBubble,
      ]}
    >
      <Text
        style={[
          styles.messageText,
          item.role === "user" && styles.userMessageText,
        ]}
      >
        {item.content}
      </Text>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.container}
    >
      <Header
        title={i18n.t("tabs:coach_title")}
        showBackButton={false}
        rightElement={
          messages.length > 0 ? (
            <Pressable onPress={clearChat} style={styles.clearButton}>
              <Ionicons name="trash-outline" size={24} color="#fff" />
            </Pressable>
          ) : undefined
        }
      />

      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.contentContainer}>
          {messages.length === 0 ? (
            <View style={styles.welcomeContainer}>
              <Ionicons name="school" size={64} color="#9ACD32" />
              <Text style={styles.title}>
                {i18n.t("tabs:coach_welcome_title")}
              </Text>
              <Text style={styles.subtitle}>
                {i18n.t("tabs:coach_welcome_sub")}
              </Text>

              {/* Suggested Prompts */}
              <View style={styles.suggestionsContainer}>
                {SUGGESTED_PROMPT_KEYS.map((key) => (
                  <Pressable
                    key={key}
                    style={styles.suggestionChip}
                    onPress={() => handleSuggestedPrompt(i18n.t(key))}
                  >
                    <Text style={styles.suggestionText}>{i18n.t(key)}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <FlatList
              ref={flatListRef}
              data={messages}
              renderItem={renderMessage}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.messageList}
              onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
              onLayout={() => flatListRef.current?.scrollToEnd()}
              onScrollBeginDrag={Keyboard.dismiss}
            />
          )}
        </View>
      </TouchableWithoutFeedback>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            value={inputText}
            onChangeText={setInputText}
            placeholder={i18n.t("tabs:coach_placeholder")}
            placeholderTextColor="#666"
            multiline
            maxLength={500}
          />
        </View>
        <Pressable
          onPress={() => sendMessage()}
          style={[
            styles.sendButton,
            (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          disabled={!inputText.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Ionicons name="send" size={24} color="#000" />
          )}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  contentContainer: {
    flex: 1,
  },
  welcomeContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  title: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  messageList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  userBubble: {
    backgroundColor: "#9ACD32",
    alignSelf: "flex-end",
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: "#222",
    alignSelf: "flex-start",
    borderBottomLeftRadius: 4,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: "#000",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#222",
    alignItems: "center",
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: "#111",
    borderRadius: 24,
    marginRight: 12,
    height: 48,
    justifyContent: "center",
  },
  input: {
    color: "#fff",
    fontSize: 16,
    paddingHorizontal: 20,
    paddingVertical: 0,
    maxHeight: 120,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#9ACD32",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  clearButton: {
    padding: 4,
    justifyContent: "center",
    alignItems: "center",
  },
  suggestionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 16,
    gap: 8,
  },
  suggestionChip: {
    backgroundColor: "#111",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#9ACD32",
    flexBasis: "48%",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 36,
  },
  suggestionText: {
    color: "#9ACD32",
    fontSize: 14,
    textAlign: "center",
  },
});
