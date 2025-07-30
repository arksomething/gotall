import { Lesson } from "./lessonTypes";

// Import weekly lesson files
import week1Data from "./lessons/week1.json";
import week2Data from "./lessons/week2.json";
import week3Data from "./lessons/week3.json";
import week4Data from "./lessons/week4.json";

// Combine all weeks into a single lessons array
const allLessons: Lesson[] = [
  ...(week1Data.lessons as Lesson[]),
  ...(week2Data.lessons as Lesson[]),
  ...(week3Data.lessons as Lesson[]),
  ...(week4Data.lessons as Lesson[]),
  // Add more weeks as they're created:
  // ...(week5Data.lessons as Lesson[]),
];

export function getLessonsForDay(day: number): Lesson[] {
  // Filter lessons by day number (extracted from lesson ID)
  return allLessons.filter((lesson) => {
    const lessonDay = parseInt(lesson.id, 10);
    return lessonDay === day;
  });
}

export function getAllLessons(): Lesson[] {
  return allLessons;
}

export function getLessonById(id: string): Lesson | undefined {
  return allLessons.find((lesson) => lesson.id === id);
}

// Helper function to get the total number of days available
export function getTotalDays(): number {
  return Math.max(...allLessons.map((lesson) => parseInt(lesson.id, 10)));
} 