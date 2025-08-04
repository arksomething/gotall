import { Lesson } from "./lessonTypes";

// Import weekly lesson files
import week1Data from "./lessons/week1.json";
import week2Data from "./lessons/week2.json";
import week3Data from "./lessons/week3.json";
import week4Data from "./lessons/week4.json";
import week5Data from "./lessons/week5.json";
import week6Data from "./lessons/week6.json";
import week7Data from "./lessons/week7.json";
import week8Data from "./lessons/week8.json";
import week9Data from "./lessons/week9.json";
import week10Data from "./lessons/week10.json";
import week11Data from "./lessons/week11.json";
import week12Data from "./lessons/week12.json";
import week13Data from "./lessons/week13.json";
import week14Data from "./lessons/week14.json";
import week15Data from "./lessons/week15.json";
import week16Data from "./lessons/week16.json";

// Combine all weeks into a single lessons array
const allLessons: Lesson[] = [
  ...(week1Data.lessons as Lesson[]),
  ...(week2Data.lessons as Lesson[]),
  ...(week3Data.lessons as Lesson[]),
  ...(week4Data.lessons as Lesson[]),
  ...(week5Data.lessons as Lesson[]),
  ...(week6Data.lessons as Lesson[]),
  ...(week7Data.lessons as Lesson[]),
  ...(week8Data.lessons as Lesson[]),
  ...(week9Data.lessons as Lesson[]),
  ...(week10Data.lessons as Lesson[]),
  ...(week11Data.lessons as Lesson[]),
  ...(week12Data.lessons as Lesson[]),
  ...(week13Data.lessons as Lesson[]),
  ...(week14Data.lessons as Lesson[]),
  ...(week15Data.lessons as Lesson[]),
  ...(week16Data.lessons as Lesson[]),
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