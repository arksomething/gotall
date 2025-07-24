import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { LessonLayout } from "../../components/LessonLayout";
import Article from "../../components/lessons/Article";
import Quiz from "../../components/lessons/Quiz";
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
  const steps = lesson.steps;
  const router = useRouter();

  const currentStep = steps[stepNum] as StepType | undefined;
  if (!currentStep) {
    router.back();
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
    switch (s.type) {
      case "text":
        return <Article step={s as any} />;
      case "quiz":
        return <Quiz step={s as any} />;
      case "video":
        return <Video step={s as any} />;
      default:
        return null;
    }
  };

  return (
    <LessonLayout
      title={lesson.title}
      currentStep={stepNum}
      totalSteps={steps.length}
      onBack={back}
      onNext={next}
    >
      {renderStep(currentStep)}
    </LessonLayout>
  );
}
