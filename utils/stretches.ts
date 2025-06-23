export interface Stretch {
  name: string;
  emoji: string;
  description: string[];
  targets: string;
  bodyParts: string[];
  youtubeUrl: string;
  youtubeId: string;
  duration: string;
}

export const stretches: Stretch[] = [
  {
    name: "Cobra Stretch",
    emoji: "🐍",
    description: [
      "Lie face down on the floor with your forehead touching the ground",
      "Place your palms flat on the floor under your shoulders",
      "Slowly push your chest up while keeping your hips pressed to the floor",
      "Keep your shoulders down and away from your ears",
      "Hold for 20–30 seconds, then slowly lower down"
    ],
    targets: "Spine, abs, chest",
    bodyParts: ["Lower back", "Abdominals", "Chest", "Hip flexors", "Shoulders"],
    youtubeUrl: "https://www.youtube.com/watch?v=jwoTJNgh8BY",
    youtubeId: "jwoTJNgh8BY",
    duration: "20-30 seconds"
  },
  {
    name: "Hanging Stretch",
    emoji: "🏋️",
    description: [
      "Find a sturdy pull-up bar that can support your weight",
      "Grip the bar with both hands, shoulder-width apart",
      "Allow your body to hang freely with arms fully extended",
      "Relax your shoulders and let gravity decompress your spine",
      "Hold for 20–40 seconds, gradually increasing time"
    ],
    targets: "Spine, shoulders, arms",
    bodyParts: ["Spine", "Latissimus dorsi", "Shoulders", "Forearms", "Core"],
    youtubeUrl: "https://www.youtube.com/watch?v=5jC2DvRFips",
    youtubeId: "5jC2DvRFips",
    duration: "20-40 seconds"
  },
  {
    name: "Cat-Cow Stretch",
    emoji: "🐱",
    description: [
      "Start on hands and knees with wrists under shoulders",
      "For 'Cow': Arch your back, drop your belly, lift your head and tailbone",
      "For 'Cat': Round your spine toward ceiling, tuck chin to chest",
      "Move slowly between positions, syncing with your breath",
      "Repeat for 10 slow, controlled movements"
    ],
    targets: "Spine flexibility and alignment",
    bodyParts: ["Entire spine", "Core muscles", "Neck", "Shoulders", "Hip flexors"],
    youtubeUrl: "https://www.youtube.com/watch?v=y39PrKY_4JM",
    youtubeId: "y39PrKY_4JM",
    duration: "10 repetitions"
  },
  {
    name: "Child's Pose",
    emoji: "🧘",
    description: [
      "Begin on hands and knees on the floor",
      "Sit back on your heels and keep your knees apart",
      "Fold forward and extend your arms in front of you",
      "Rest your forehead on the floor if possible",
      "Breathe deeply and relax into the position for 30–60 seconds"
    ],
    targets: "Lower back, hips, spine",
    bodyParts: ["Lower back", "Hips", "Thighs", "Ankles", "Shoulders"],
    youtubeUrl: "https://www.youtube.com/watch?v=EniGBCHAEVQ",
    youtubeId: "EniGBCHAEVQ",
    duration: "30-60 seconds"
  },
  {
    name: "Forward Bend (Standing Toe Touch)",
    emoji: "🤸",
    description: [
      "Stand tall with feet hip-width apart",
      "Slowly hinge at your hips and fold forward",
      "Let your arms hang down toward your toes",
      "Keep a slight bend in your knees if needed",
      "Don't force it - go only as far as comfortable",
      "Hold for 20–30 seconds"
    ],
    targets: "Hamstrings, spine, lower back",
    bodyParts: ["Hamstrings", "Calves", "Lower back", "Spine", "Glutes"],
    youtubeUrl: "https://www.youtube.com/watch?v=VOPnBMKTbO8",
    youtubeId: "VOPnBMKTbO8",
    duration: "20-30 seconds"
  },
  {
    name: "Bridge Stretch",
    emoji: "🌉",
    description: [
      "Lie on your back with knees bent, feet flat on floor",
      "Keep your feet hip-width apart and arms at your sides",
      "Press through your heels and lift your hips up",
      "Squeeze your glutes and keep your core engaged",
      "Hold for 15–20 seconds, then slowly lower down"
    ],
    targets: "Back, glutes, hip flexors",
    bodyParts: ["Glutes", "Hamstrings", "Hip flexors", "Lower back", "Core"],
    youtubeUrl: "https://www.youtube.com/watch?v=WtilA9IJX1c",
    youtubeId: "WtilA9IJX1c",
    duration: "15-20 seconds"
  },
  {
    name: "Seated Forward Fold",
    emoji: "🪑",
    description: [
      "Sit on the floor with legs extended straight in front",
      "Keep your spine tall and shoulders relaxed",
      "Slowly hinge forward at your hips",
      "Reach toward your toes without forcing it",
      "Keep your back straight as you fold forward",
      "Hold for 20–30 seconds"
    ],
    targets: "Hamstrings, spine",
    bodyParts: ["Hamstrings", "Calves", "Lower back", "Spine", "Shoulders"],
    youtubeUrl: "https://www.youtube.com/watch?v=SLIaql7h6RQ",
    youtubeId: "SLIaql7h6RQ",
    duration: "20-30 seconds"
  },
  {
    name: "Side Stretch",
    emoji: "↔️",
    description: [
      "Stand or sit with your spine straight",
      "Raise your right arm overhead",
      "Gently lean to the left, creating a curve in your spine",
      "Feel the stretch along your right side",
      "Hold for 15–20 seconds, then switch sides",
      "Keep both hips facing forward"
    ],
    targets: "Obliques, spine, ribs",
    bodyParts: ["Obliques", "Intercostal muscles", "Latissimus dorsi", "Spine", "Shoulders"],
    youtubeUrl: "https://www.youtube.com/watch?v=kqnua4rHVVA",
    youtubeId: "kqnua4rHVVA",
    duration: "15-20 seconds each side"
  },
  {
    name: "Downward Dog",
    emoji: "🐕",
    description: [
      "Start on hands and knees with wrists under shoulders",
      "Tuck your toes under and lift your hips up and back",
      "Straighten your legs and create an inverted V shape",
      "Press your hands firmly into the ground",
      "Try to press your heels toward the floor",
      "Hold for 20–30 seconds"
    ],
    targets: "Full-body, spine, hamstrings",
    bodyParts: ["Hamstrings", "Calves", "Shoulders", "Arms", "Core", "Back"],
    youtubeUrl: "https://www.youtube.com/watch?v=j97SSGsnCAQ",
    youtubeId: "j97SSGsnCAQ",
    duration: "20-30 seconds"
  },
  {
    name: "Spinal Twist",
    emoji: "🌀",
    description: [
      "Sit cross-legged or lie on your back",
      "If sitting: Place right hand behind you for support",
      "If lying: Keep shoulders on the ground",
      "Gently rotate your torso to one side",
      "Look over your shoulder in the direction of the twist",
      "Hold for 20 seconds, then switch sides"
    ],
    targets: "Spine, obliques, lower back",
    bodyParts: ["Spine", "Obliques", "Hip flexors", "Glutes", "Lower back"],
    youtubeUrl: "https://www.youtube.com/watch?v=ciGK6HyYqV4",
    youtubeId: "ciGK6HyYqV4",
    duration: "20 seconds each side"
  }
]; 