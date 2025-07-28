// Generic lesson/step types so that we can render different step kinds
export type ArticleStep = {
  type: "article";
  title: string;
  text: string;
  image?: string;
};

export type VideoStep = {
  type: "video";
  title: string;
  youtubeUrl: string;
  youtubeId: string;
};

export type QuizStep = {
  type: "quiz";
  title: string;
  prompt: string;
  choices: string[];
  answer: number; // index of correct answer
};

export type TimerStep = {
  type: "timer";
  title: string;
  duration: number; // in seconds
  description?: string;
  sets?: number;
  image?: string;
  timeOptions?: {
    start: number;
    end: number;
    increment: number;
  };
};

export type ReminderStep = {
  type: "reminder";
  title: string;
  prompt: string;
  time?: string;
  description?: string;
  image?: string;
};

export type FoodStep = {
  type: "food";
  title: string;
};

export type UpdateStep = {
  type: "update";
  title: string;
  measurement: "height" | "weight";
};

export type StretchStep = {
  type: "stretch";
  title: string;
  gif: string;
  durationSec: number;
};

export type Step =
  | ArticleStep
  | VideoStep
  | QuizStep
  | StretchStep
  | TimerStep
  | ReminderStep
  | FoodStep
  | UpdateStep;

export interface Lesson {
  id: string;
  title: string;
  description: string;
  steps: Step[];
}

export interface DayBlock {
  day: number;
  lessons: Lesson[];
} 