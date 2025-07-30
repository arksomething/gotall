import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { LessonLayout } from "../../components/LessonLayout";
import Article from "../../components/lessons/Article";
import Food from "../../components/lessons/Food";
import Quiz from "../../components/lessons/Quiz";
import Reminder from "../../components/lessons/Reminder";
import Timer from "../../components/lessons/Timer";
import Update from "../../components/lessons/Update";
import Video from "../../components/lessons/Video";
import { databaseManager } from "../../utils/database";
import { getLessonsForDay } from "../../utils/lessons";
import { Step as StepType } from "../../utils/lessonTypes";

export default function LessonStepPage() {
  const { day, step } = useLocalSearchParams<{ day: string; step: string }>();
  const dayNum = parseInt(day ?? "1", 10);
  const stepNum = parseInt(step ?? "0", 10);
  const lessons = getLessonsForDay(dayNum);
  const lesson = lessons[0]; // single lesson for now
  const router = useRouter();

  // Handle navigation side effects in useEffect
  useEffect(() => {
    // Check if lesson exists
    if (!lesson) {
      // No lesson found for this day, redirect to roadmap
      router.replace("/(tabs)/roadmap");
      return;
    }

    const steps = lesson.steps;
    const currentStep = steps[stepNum] as StepType | undefined;
    if (!currentStep) {
      router.back();
      return;
    }
  }, [lesson, stepNum, router]);

  // Check if lesson exists
  if (!lesson) {
    return null;
  }

  const steps = lesson.steps;
  const currentStep = steps[stepNum] as StepType | undefined;
  if (!currentStep) {
    return null;
  }

  const next = () => {
    if (stepNum < steps.length - 1) {
      router.push({
        pathname: "/(tabs)/lesson",
        params: {
          day: String(dayNum),
          step: String(stepNum + 1),
        },
      });
    } else {
      databaseManager.markLessonsUpToDay(lesson.id, dayNum, 30);
      router.push("/(tabs)/roadmap");
    }
  };

  const back = () => {
    if (stepNum > 0) {
      router.push({
        pathname: "/(tabs)/lesson",
        params: {
          day: String(dayNum),
          step: String(stepNum - 1),
        },
      });
    } else {
      router.push("/(tabs)/roadmap");
    }
  };

  const renderStep = (s: StepType) => {
    let description = null;
    let image = null;

    if ("description" in s && s.description) {
      description = s.description;
    }
    if ("image" in s && s.image) {
      image = s.image;
    }

    let stepComponent;
    switch (s.type) {
      case "article":
        stepComponent = <Article step={s as any} />;
        break;
      case "quiz":
        stepComponent = <Quiz step={s as any} />;
        break;
      case "video":
        stepComponent = <Video step={s as any} />;
        break;
      case "timer":
        stepComponent = <Timer step={s as any} />;
        break;
      case "reminder":
        stepComponent = <Reminder step={s as any} />;
        break;
      case "food":
        stepComponent = <Food />;
        break;
      case "update":
        stepComponent = <Update step={s as any} />;
        break;
      default:
        stepComponent = null;
    }

    return (
      <View style={styles.stepContainer}>
        {stepComponent}
        {description && <Text style={styles.description}>{description}</Text>}
        {image && <Image source={{ uri: image }} style={styles.image} />}
      </View>
    );
  };

  return (
    <LessonLayout
      title={currentStep.title || lesson.title}
      currentStep={stepNum}
      totalSteps={steps.length}
      onBack={back}
      onNext={next}
    >
      {renderStep(currentStep)}
    </LessonLayout>
  );
}

const styles = StyleSheet.create({
  stepContainer: {
    flex: 1,
  },
  description: {
    fontSize: 16,
    color: "#eee",
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 10,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
    marginTop: 20,
    resizeMode: "contain",
  },
});
