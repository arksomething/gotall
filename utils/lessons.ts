import { Lesson } from "./lessonTypes";
import lessonsData from "./lessons.json";

const { lessons } = lessonsData;

export function getLessonsForDay(day: number): Lesson[] {
  const lesson = lessons.find(lesson => lesson.id === String(day));
  return lesson ? [lesson as Lesson] : [];
} 