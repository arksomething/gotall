import { Lesson } from "./lessonTypes";
import lessonsData from "./lessons.json";

const { lessons } = lessonsData;

// For now every day returns the same lessons; later this can be extended.
export function getLessonsForDay(day: number): Lesson[] {
  // TODO: replace with day-specific data when available
  return lessons as Lesson[];
} 