import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useFocusEffect, useRouter } from "expo-router";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Header } from "../../components/Header";
import RoadmapNode from "../../components/RoadmapNode";
import { databaseManager } from "../../utils/database";
import { getLessonsForDay } from "../../utils/lessons";
import lessonsData from "../../utils/lessons.json";

export default function RoadmapScreen() {
  const router = useRouter();

  const insets = useSafeAreaInsets();

  const TOTAL_DAYS = lessonsData.lessons.length;
  const [completedDayCount, setCompletedDayCount] = useState(0);
  const nodePositions = useRef<{ [key: number]: number }>({});
  const baselineNodePositions = useRef<{ [key: number]: number }>({});
  const baselineHeight = useRef(0);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const [lessonCompletion, setLessonCompletion] = useState<{
    [key: string]: boolean;
  }>({});

  useFocusEffect(
    useCallback(() => {
      const fetchLessonCompletion = async () => {
        const completionStatus: { [key: string]: boolean } = {};
        for (let i = 1; i <= TOTAL_DAYS; i++) {
          const lessons = getLessonsForDay(i);
          for (const lesson of lessons) {
            const lessonId = `${lesson.id}-${i}`;
            completionStatus[lessonId] =
              await databaseManager.getLessonCompletionStatus(lessonId);
          }
        }
        setLessonCompletion(completionStatus);
      };
      fetchLessonCompletion();
    }, [])
  );

  useEffect(() => {
    let consecutiveDays = 0;
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      const lessons = getLessonsForDay(i);
      if (!lessons.length) break;
      const lesson = lessons[0];
      const lessonId = `${lesson.id}-${i}`;
      if (lessonCompletion[lessonId]) {
        consecutiveDays = i;
      } else {
        break;
      }
    }
    setCompletedDayCount(consecutiveDays);
  }, [lessonCompletion]);

  const [didInitialScroll, setDidInitialScroll] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);

  const daysArray = useMemo(() => {
    const days = [] as number[];
    for (let i = 1; i <= TOTAL_DAYS; i++) {
      days.push(i);
    }
    return days;
  }, []);

  const progressTarget = useMemo(() => {
    // Prefer baseline measurements captured when no dropdown is open
    const baselinePos = baselineNodePositions.current[completedDayCount];
    if (baselineHeight.current > 0 && baselinePos !== undefined) {
      return baselineHeight.current - baselinePos;
    }
    // Fallback to live measurements
    const livePos = nodePositions.current[completedDayCount];
    if (containerHeight > 0 && livePos !== undefined) {
      return containerHeight - livePos;
    }
    return 0;
  }, [containerHeight, completedDayCount]);

  const progressAnim = useRef(new Animated.Value(0)).current;
  const animationTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (animationTimeout.current) {
      clearTimeout(animationTimeout.current);
    }
    // Delay animation slightly to allow layout to settle when dropdown expands/collapses
    animationTimeout.current = setTimeout(() => {
      Animated.timing(progressAnim, {
        toValue: progressTarget,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }, 120); // 120ms delay; tweak as needed

    return () => {
      if (animationTimeout.current) clearTimeout(animationTimeout.current);
    };
  }, [progressTarget]);

  const handleDayPress = (day: number) => {
    setExpandedDay((prev) => (prev === day ? null : day));
  };

  return (
    <View style={styles.container}>
      <Header
        title="Roadmap"
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

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={(w, h) => {
          if (!didInitialScroll) {
            scrollRef.current?.scrollTo({ y: h, animated: false });
            setDidInitialScroll(true);
          }
        }}
      >
        <View
          style={styles.roadmapContainer}
          onLayout={(e) => {
            const h = e.nativeEvent.layout.height;
            setContainerHeight(h);
            if (expandedDay === null) {
              baselineHeight.current = h;
            }
          }}
        >
          {/* Background track */}
          <View style={styles.progressTrack} />
          {/* Filled progress */}
          <Animated.View
            style={[styles.progressFill, { height: progressAnim }]}
          />

          {/* Daily task buttons */}
          <View style={styles.nodesWrapper}>
            {daysArray.map((day) => {
              const isMilestone = day % 5 === 0;
              const diameter = isMilestone ? 80 : 60;

              const lessons = getLessonsForDay(day);
              const lesson = lessons[0];
              const lessonId = lesson ? `${lesson.id}-${day}` : `day-${day}`;
              const isCompleted = lesson ? lessonCompletion[lessonId] : false;

              // Check if this lesson is unlocked (previous lesson completed)
              const isUnlocked =
                day === 1 ||
                (() => {
                  const previousDay = day - 1;
                  const previousLessons = getLessonsForDay(previousDay);
                  if (previousLessons.length === 0) return true; // If no previous lesson, allow access
                  const previousLesson = previousLessons[0];
                  const previousLessonId = `${previousLesson.id}-${previousDay}`;
                  return lessonCompletion[previousLessonId] === true;
                })();

              let content: React.ReactNode;
              if (isCompleted) {
                content = <Ionicons name="checkmark" size={24} color="#fff" />;
              } else if (isMilestone) {
                content = <Ionicons name="star" size={24} color="#fff" />;
              } else {
                content = (
                  <Text style={{ color: "#fff", fontWeight: "500" }}>
                    {day}
                  </Text>
                );
              }

              const handleMeasure = (d: number, y: number) => {
                nodePositions.current[d] = y;
                if (expandedDay === null) {
                  baselineNodePositions.current[d] = y;
                }
              };

              return (
                <RoadmapNode
                  key={day}
                  diameter={diameter}
                  completed={isCompleted}
                  expanded={expandedDay === day}
                  onPress={() => handleDayPress(day)}
                  onToggleComplete={async () => {
                    Haptics.selectionAsync();
                    const lessons = getLessonsForDay(day);
                    if (!lessons.length) return;
                    const lesson = lessons[0];

                    if (isCompleted) {
                      // Unmark from current day onwards
                      for (let i = day; i <= TOTAL_DAYS; i++) {
                        const dayLessons = getLessonsForDay(i);
                        for (const dayLesson of dayLessons) {
                          const lessonId = `${dayLesson.id}-${i}`;
                          await databaseManager.removeLessonCompletion(
                            lessonId
                          );
                        }
                      }
                    } else {
                      // Mark from day 1 up to current day
                      for (let i = 1; i <= day; i++) {
                        const dayLessons = getLessonsForDay(i);
                        for (const dayLesson of dayLessons) {
                          const lessonId = `${dayLesson.id}-${i}`;
                          await databaseManager.addLessonCompletion(lessonId);
                        }
                      }
                    }

                    // Manually update local state for immediate feedback
                    const newCompletionStatus = { ...lessonCompletion };
                    if (isCompleted) {
                      // Unmark from current day onwards
                      for (let i = day; i <= TOTAL_DAYS; i++) {
                        const dayLessons = getLessonsForDay(i);
                        for (const dayLesson of dayLessons) {
                          newCompletionStatus[`${dayLesson.id}-${i}`] = false;
                        }
                      }
                    } else {
                      // Mark from day 1 up to current day
                      for (let i = 1; i <= day; i++) {
                        const dayLessons = getLessonsForDay(i);
                        for (const dayLesson of dayLessons) {
                          newCompletionStatus[`${dayLesson.id}-${i}`] = true;
                        }
                      }
                    }
                    setLessonCompletion(newCompletionStatus);
                    setExpandedDay(null);
                  }}
                  label={`Day ${day}`}
                  description={
                    <Text style={styles.descriptionText}>
                      {lesson
                        ? lesson.description
                        : `No lesson available for Day ${day}`}
                    </Text>
                  }
                  day={day}
                  onMeasure={handleMeasure}
                  onStartLessons={() => {
                    if (isUnlocked) {
                      router.push({
                        pathname: "/(tabs)/lesson",
                        params: { day: String(day), step: "0" },
                      });
                    }
                  }}
                  isUnlocked={isUnlocked}
                >
                  {content}
                </RoadmapNode>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  scrollContent: {
    paddingHorizontal: 32,
    paddingVertical: 32,
  },
  roadmapContainer: {
    position: "relative",
    alignSelf: "stretch",
  },
  nodesWrapper: {
    flexDirection: "column-reverse",
    alignItems: "flex-start",
  },
  progressTrack: {
    position: "absolute",
    left: 24,
    top: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: "#222",
    height: "100%",
  },
  progressFill: {
    position: "absolute",
    left: 24,
    bottom: 0,
    width: 6,
    borderRadius: 3,
    backgroundColor: "#9ACD32",
  },
  taskButton: {
    position: "absolute",
    left: 24,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  text: {
    fontSize: 18,
    fontWeight: "500",
    color: "#fff",
  },
  descriptionText: {
    color: "#fff",
    fontSize: 14,
  },
});
