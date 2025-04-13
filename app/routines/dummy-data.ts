export interface RoutineItem {
  id: string;
  activityName: string;
  description: string;
  plannedDuration: number; // in minutes
  category?: string;
  timeBlock?: "morning" | "afternoon" | "evening";
  priority: number;
}

export interface Routine {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  isTemplate: boolean;
  isActive?: boolean;
  items: RoutineItem[];
}

export const dummyRoutines: Routine[] = [
  {
    id: "1",
    name: "Interview Preparation Day",
    createdAt: new Date("2024-03-01"),
    updatedAt: new Date("2024-03-15"),
    isTemplate: true,
    items: [
      {
        id: "1-1",
        activityName: "LeetCode Practice",
        description: "Focus on dynamic programming and graph problems",
        plannedDuration: 120,
        category: "Technical",
        timeBlock: "morning",
        priority: 1,
      },
      {
        id: "1-2",
        activityName: "System Design Review",
        description: "Study distributed systems and scalability patterns",
        plannedDuration: 90,
        category: "Technical",
        timeBlock: "afternoon",
        priority: 2,
      },
      {
        id: "1-3",
        activityName: "Behavioral Practice",
        description: "Prepare STAR method responses for common questions",
        plannedDuration: 60,
        category: "Soft Skills",
        timeBlock: "evening",
        priority: 3,
      },
    ],
  },
  {
    id: "2",
    name: "Work Focus Day",
    createdAt: new Date("2024-03-05"),
    updatedAt: new Date("2024-03-15"),
    isTemplate: true,
    items: [
      {
        id: "2-1",
        activityName: "Deep Work Session",
        description: "Focus on complex coding tasks without interruptions",
        plannedDuration: 180,
        category: "Work",
        timeBlock: "morning",
        priority: 1,
      },
      {
        id: "2-2",
        activityName: "Team Collaboration",
        description: "Code reviews and pair programming sessions",
        plannedDuration: 120,
        category: "Work",
        timeBlock: "afternoon",
        priority: 2,
      },
      {
        id: "2-3",
        activityName: "Documentation",
        description: "Update project documentation and write technical blogs",
        plannedDuration: 60,
        category: "Work",
        timeBlock: "evening",
        priority: 3,
      },
    ],
  },
  {
    id: "3",
    name: "My Current Routine",
    createdAt: new Date("2024-03-10"),
    updatedAt: new Date("2024-03-15"),
    isTemplate: false,
    isActive: true,
    items: [
      {
        id: "3-1",
        activityName: "Interview Preparation",
        description: "Practice coding problems and system design",
        plannedDuration: 120,
        category: "Learning",
        timeBlock: "morning",
        priority: 1,
      },
      {
        id: "3-2",
        activityName: "Office Work",
        description: "Complete project tasks and attend meetings",
        plannedDuration: 360,
        category: "Work",
        timeBlock: "afternoon",
        priority: 2,
      },
      {
        id: "3-3",
        activityName: "Leetcode Practice",
        description: "Solve medium to hard problems",
        plannedDuration: 120,
        category: "Learning",
        timeBlock: "evening",
        priority: 3,
      },
      {
        id: "3-4",
        activityName: "Job Search",
        description: "Update resume and apply to positions",
        plannedDuration: 60,
        category: "Career",
        timeBlock: "evening",
        priority: 4,
      },
    ],
  },
  {
    id: "4",
    name: "Weekend Learning",
    createdAt: new Date("2024-03-12"),
    updatedAt: new Date("2024-03-15"),
    isTemplate: false,
    items: [
      {
        id: "4-1",
        activityName: "New Technology Study",
        description: "Learn about new frameworks and tools",
        plannedDuration: 180,
        category: "Learning",
        timeBlock: "morning",
        priority: 1,
      },
      {
        id: "4-2",
        activityName: "Project Work",
        description: "Work on personal projects",
        plannedDuration: 240,
        category: "Work",
        timeBlock: "afternoon",
        priority: 2,
      },
    ],
  },
];
