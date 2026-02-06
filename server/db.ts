import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.warn("MONGODB_URI not set - database features will be disabled");
}

let isConnected = false;

export async function connectDB(): Promise<boolean> {
  if (!MONGODB_URI) {
    return false;
  }

  if (isConnected) {
    return true;
  }

  try {
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log("Connected to MongoDB");
    return true;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    return false;
  }
}

// User Profile Schema - stores all user profile data
const userSchema = new mongoose.Schema({
  odisId: { type: String, required: true, unique: true, index: true },
  whopUserId: { type: String, sparse: true, index: true },
  whopUsername: { type: String },
  whopProfilePictureUrl: { type: String },
  whopAccessLevel: { type: String, enum: ['customer', 'admin', 'no_access'] },
  fullName: { type: String, required: true },
  birthDate: { type: Date, required: true },
  birthTime: { type: String, default: "" },
  birthLocation: { type: String, default: "" },
  isPro: { type: Boolean, default: false },
  proPaymentReceiptId: { type: String, sparse: true, index: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.pre("save", function () {
  this.updatedAt = new Date();
});

export const UserModel = mongoose.model("User", userSchema);

// Daily Energy Reading Schema - stores AI-generated daily readings
const dailyEnergySchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  personalDayNumber: { type: Number, required: true },
  universalDayNumber: { type: Number, required: true },
  energyScore: { type: Number, required: true },
  theme: { type: String, required: true },
  description: { type: String, required: true },
  dos: [{ type: String }],
  donts: [{ type: String }],
  focusArea: { type: String, required: true },
  affirmation: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

dailyEnergySchema.index({ odisId: 1, date: 1 }, { unique: true });

export const DailyEnergyModel = mongoose.model("DailyEnergy", dailyEnergySchema);

// Personality Insights Schema - stores AI-generated personality analysis
const personalityInsightSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  overview: { type: String, required: true },
  strengths: [{ type: String }],
  challenges: [{ type: String }],
  lifeLesson: { type: String, required: true },
  careerPaths: [{ type: String }],
  relationshipStyle: { type: String, required: true },
  spiritualGifts: [{ type: String }],
  profileSnapshot: {
    fullName: String,
    birthDate: String,
    lifePathNumber: Number,
    expressionNumber: Number,
    soulUrgeNumber: Number,
    westernZodiac: String,
    chineseZodiac: String,
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export const PersonalityInsightModel = mongoose.model("PersonalityInsight", personalityInsightSchema);

// Number Deep Report Schema - stores AI-generated deep-dive reports for each core number
const numberDeepReportSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  numberType: { type: String, required: true, enum: ['lifePath', 'expression', 'soulUrge', 'personality', 'maturity'] },
  numberValue: { type: Number, required: true },
  overview: { type: String, required: true },
  uniqueExpression: { type: String, required: true },
  dailyLife: { type: String, required: true },
  superpower: { type: String, required: true },
  shadowSide: { type: String, required: true },
  famousExamples: [{ name: String, why: String }],
  thisYear: { type: String, required: true },
  actionSteps: [{ type: String }],
  journalPrompts: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

numberDeepReportSchema.index({ odisId: 1, numberType: 1 }, { unique: true });

export const NumberDeepReportModel = mongoose.model("NumberDeepReport", numberDeepReportSchema);

// Chat History Schema - stores persistent chat conversations
const chatHistorySchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  sessionId: { type: String, required: true, index: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  }],
  mode: { type: String, enum: ['daily', 'decision', 'relationship', 'dream', 'conflict', 'general'], default: 'general' },
  tags: [{ type: String }],
  title: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

chatHistorySchema.index({ odisId: 1, createdAt: -1 });

export const ChatHistoryModel = mongoose.model("ChatHistory", chatHistorySchema);

// Daily Journal Schema - tracks user's daily mood, energy, and activities
const dailyJournalSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  mood: { type: Number, min: 1, max: 5 },
  energyLevel: { type: Number, min: 1, max: 5 },
  activities: [{ type: String }],
  notes: { type: String },
  personalDayNumber: { type: Number },
  predictionAccuracy: { type: Number, min: 0, max: 100 },
  createdAt: { type: Date, default: Date.now },
});

dailyJournalSchema.index({ odisId: 1, date: 1 }, { unique: true });

export const DailyJournalModel = mongoose.model("DailyJournal", dailyJournalSchema);

// Goal Schema - user goals with numerology timing
const goalSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String },
  category: { type: String, enum: ['career', 'relationship', 'health', 'spiritual', 'financial', 'personal'], required: true },
  bestDates: [{ type: String }],
  bestMonths: [{ type: Number }],
  status: { type: String, enum: ['active', 'completed', 'paused'], default: 'active' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  completedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

goalSchema.index({ odisId: 1, status: 1 });

export const GoalModel = mongoose.model("Goal", goalSchema);

// Saved Insight Schema - user's saved insights library
const savedInsightSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  source: { type: String, required: true, enum: ['chat', 'daily', 'personality', 'compatibility', 'explore', 'number', 'other'] },
  content: { type: String, required: true },
  title: { type: String },
  category: { type: String },
  tags: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

savedInsightSchema.index({ odisId: 1, createdAt: -1 });

export const SavedInsightModel = mongoose.model("SavedInsight", savedInsightSchema);

// Relationship Library Schema - stored relationships for compatibility tracking
const relationshipSchema = new mongoose.Schema({
  odisId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  relationshipType: { type: String, enum: ['partner', 'parent', 'sibling', 'friend', 'coworker', 'boss', 'other'], required: true },
  birthDate: { type: Date, required: true },
  birthTime: { type: String },
  birthLocation: { type: String },
  compatibilityScore: { type: Number },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

relationshipSchema.index({ odisId: 1 });

export const RelationshipModel = mongoose.model("Relationship", relationshipSchema);

// User Streak Schema - tracks engagement streaks
const userStreakSchema = new mongoose.Schema({
  odisId: { type: String, required: true, unique: true, index: true },
  currentStreak: { type: Number, default: 0 },
  longestStreak: { type: Number, default: 0 },
  lastCheckIn: { type: Date },
  totalCheckIns: { type: Number, default: 0 },
  achievements: [{ type: String }],
  updatedAt: { type: Date, default: Date.now },
});

export const UserStreakModel = mongoose.model("UserStreak", userStreakSchema);

// TypeScript interfaces
export interface DBUser {
  id: string;
  odisId: string;
  whopUserId?: string | null;
  whopUsername?: string | null;
  whopProfilePictureUrl?: string | null;
  whopAccessLevel?: 'customer' | 'admin' | 'no_access' | null;
  fullName: string;
  birthDate: Date;
  birthTime?: string | null;
  birthLocation?: string | null;
  isPro: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBDailyEnergy {
  id: string;
  odisId: string;
  date: string;
  personalDayNumber: number;
  universalDayNumber: number;
  energyScore: number;
  theme: string;
  description: string;
  dos: string[];
  donts: string[];
  focusArea: string;
  affirmation: string;
  createdAt: Date;
}

export interface DBPersonalityInsight {
  id: string;
  odisId: string;
  overview: string;
  strengths: string[];
  challenges: string[];
  lifeLesson: string;
  careerPaths: string[];
  relationshipStyle: string;
  spiritualGifts: string[];
  profileSnapshot: {
    fullName?: string | null;
    birthDate?: string | null;
    lifePathNumber?: number | null;
    expressionNumber?: number | null;
    soulUrgeNumber?: number | null;
    westernZodiac?: string | null;
    chineseZodiac?: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface DBNumberDeepReport {
  id: string;
  odisId: string;
  numberType: 'lifePath' | 'expression' | 'soulUrge' | 'personality' | 'maturity';
  numberValue: number;
  overview: string;
  uniqueExpression: string;
  dailyLife: string;
  superpower: string;
  shadowSide: string;
  famousExamples: Array<{ name: string; why: string }>;
  thisYear: string;
  actionSteps: string[];
  journalPrompts: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DBChatHistory {
  id: string;
  odisId: string;
  sessionId: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  mode: 'daily' | 'decision' | 'relationship' | 'dream' | 'conflict' | 'general';
  tags: string[];
  title?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBDailyJournal {
  id: string;
  odisId: string;
  date: string;
  mood?: number;
  energyLevel?: number;
  activities: string[];
  notes?: string;
  personalDayNumber?: number;
  predictionAccuracy?: number;
  createdAt: Date;
}

export interface DBGoal {
  id: string;
  odisId: string;
  title: string;
  description?: string;
  category: 'career' | 'relationship' | 'health' | 'spiritual' | 'financial' | 'personal';
  bestDates: string[];
  bestMonths: number[];
  status: 'active' | 'completed' | 'paused';
  progress: number;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBSavedInsight {
  id: string;
  odisId: string;
  source: 'chat' | 'daily' | 'personality' | 'compatibility' | 'explore' | 'number' | 'other';
  content: string;
  title?: string;
  category?: string;
  tags: string[];
  createdAt: Date;
}

export interface DBRelationship {
  id: string;
  odisId: string;
  name: string;
  relationshipType: 'partner' | 'parent' | 'sibling' | 'friend' | 'coworker' | 'boss' | 'other';
  birthDate: Date;
  birthTime?: string;
  birthLocation?: string;
  compatibilityScore?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DBUserStreak {
  id: string;
  odisId: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: Date;
  totalCheckIns: number;
  achievements: string[];
  updatedAt: Date;
}
