// Generic lesson/step types so that we can render different step kinds
export type TextStep = {
  type: "text";
  title: string;
  markdown: string;
};

export type VideoStep = {
  type: "video";
  title: string;
  url: string;
};

export type QuizStep = {
  type: "quiz";
  prompt: string;
  choices: string[];
  answer: number; // index of correct answer
};

export type StretchStep = {
  type: "stretch";
  title: string;
  gif: string;
  durationSec: number;
};

export type Step = TextStep | VideoStep | QuizStep | StretchStep;

export interface Lesson {
  id: string;
  title: string;
  steps: Step[];
}

export interface DayBlock {
  day: number;
  lessons: Lesson[];
} 