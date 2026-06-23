export interface IdentityProfile {
  name: string;
  age?: number;
  gender?: string;
  occupation?: string;
}

export interface HealthProfile {
  weight?: number;
  systolicBP?: number;
  diastolicBP?: number;
  bloodType?: string;
  medications: string[];
  conditions: string[];
  allergies: string[];
}

export interface SportsProfile {
  activities: string[];
  frequencyPerWeek?: number;
  lastSportDate?: string;
}

export interface GoalProfile {
  activeGoals: string[];
  completedGoals: string[];
}

export interface LifeProfileData {
  identity: IdentityProfile;
  health: HealthProfile;
  sports: SportsProfile;
  goals: GoalProfile;
  habits: string[];
  work: {
    company?: string;
    role?: string;
    hoursPerWeek?: number;
  };
  relationships: string[];
  projects: string[];
  preferences: Record<string, any>;
  routines: string[];
  devices: string[];
  vehicles: string[];
  skills: string[];
  languages: string[];
  location: {
    homeAddress?: string;
    officeAddress?: string;
    city?: string;
  };
  calendar: {
    meetingCount: number;
    upcomingMeetings: string[];
  };
  statistics: {
    totalMessagesSent: number;
    totalMemoriesStored: number;
    activeTopic?: string;
    lastCommandTime?: string;
  };
}

export const initialLifeProfile: LifeProfileData = {
  identity: { name: 'Metin' },
  health: { medications: [], conditions: [], allergies: [] },
  sports: { activities: [] },
  goals: { activeGoals: [], completedGoals: [] },
  habits: [],
  work: {},
  relationships: [],
  projects: [],
  preferences: {},
  routines: [],
  devices: [],
  vehicles: [],
  skills: [],
  languages: [],
  location: {},
  calendar: { meetingCount: 0, upcomingMeetings: [] },
  statistics: { totalMessagesSent: 0, totalMemoriesStored: 0 }
};
