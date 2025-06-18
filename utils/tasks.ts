export interface Task {
  name: string;
  emoji: string;
  description: string[];
  category: string;
  benefits: string[];
  timeOfDay: string;
  duration: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export const dailyTasks: Task[] = [
  {
    name: "20 Minute Walk",
    emoji: "🚶‍♂️",
    description: [
      "Walk outside for exactly 20 minutes at a comfortable pace",
      "Focus on walking tall with shoulders back and core engaged",
      "Keep your head up and eyes forward, looking at the horizon",
      "Swing your arms naturally and maintain good posture throughout",
      "If possible, choose routes with varied terrain or gentle hills",
      "Use this time to clear your mind and focus on your body alignment",
      "End with a few deep breaths and notice how you feel"
    ],
    category: "Movement",
    benefits: ["Decompresses spine through movement", "Improves posture awareness", "Boosts circulation"],
    timeOfDay: "Morning or Evening",
    duration: "20 minutes",
    difficulty: "Easy"
  },

  {
    name: "20 Minutes Sports Exercise",
    emoji: "⚽",
    description: [
      "Choose any sport or active exercise you enjoy for 20 minutes",
      "Great options: basketball, tennis, volleyball, swimming, jumping rope",
      "Focus on activities that involve jumping, reaching, or stretching",
      "Warm up for 3-5 minutes before starting intense activity",
      "Play actively and push yourself while maintaining good form",
      "Include movements that extend your spine and limbs",
      "Cool down with light stretching for the last 3-5 minutes"
    ],
    category: "Exercise",
    benefits: ["Stimulates growth plates", "Improves coordination", "Builds functional strength"],
    timeOfDay: "Afternoon or Evening",
    duration: "20 minutes",
    difficulty: "Medium"
  },
  {
    name: "15 Minutes Hanging & Stretching",
    emoji: "🤸‍♀️",
    description: [
      "Find a pull-up bar, playground equipment, or doorway pull-up bar",
      "Start with 5 sets of 30-second hangs with 1-minute rest between",
      "If you can't hang, do supported hangs with feet touching ground",
      "Follow with spinal stretches: cat-cow, child's pose, forward fold",
      "Do doorway chest stretches to counter forward posture",
      "End with legs up the wall pose for final spinal decompression",
      "Focus on lengthening your spine throughout all movements"
    ],
    category: "Flexibility",
    benefits: ["Decompresses spine naturally", "Improves spinal mobility", "Counters daily compression"],
    timeOfDay: "Morning or Evening",
    duration: "15 minutes",
    difficulty: "Medium"
  },
  {
    name: "1 Hour Winddown Before Bed",
    emoji: "🌙",
    description: [
      "Start your winddown routine exactly 1 hour before intended sleep time",
      "Begin with gentle stretching: focus on spine, hips, and shoulders (15 minutes)",
      "Take a warm shower or bath to relax muscles (10-15 minutes)",
      "Practice legs up the wall pose or gentle spinal twists (10 minutes)",
      "Set up optimal sleep position: supportive pillow, comfortable mattress",
      "Dim all lights and avoid screens during this hour",
      "End with deep breathing or meditation to prepare for restorative sleep",
      "Visualize your body growing and recovering during sleep"
    ],
    category: "Recovery",
    benefits: ["Promotes spinal recovery", "Prepares body for growth during sleep", "Improves sleep quality"],
    timeOfDay: "Evening",
    duration: "1 hour",
    difficulty: "Easy"
  }
];
