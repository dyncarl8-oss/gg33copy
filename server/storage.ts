import { connectDB, UserModel, DailyEnergyModel, PersonalityInsightModel, type DBUser, type DBDailyEnergy, type DBPersonalityInsight } from "./db";
import crypto from "crypto";

export interface LessonProgress {
  lessonId: string;
  completed: boolean;
}

export interface IStorage {
  // User operations
  getUserByOdisId(odisId: string): Promise<DBUser | null>;
  getUserByWhopId(whopUserId: string): Promise<DBUser | null>;
  createUser(data: { odisId: string; fullName: string; birthDate: Date; birthTime?: string; birthLocation?: string; whopUserId?: string; whopUsername?: string; whopProfilePictureUrl?: string; whopAccessLevel?: 'customer' | 'admin' | 'no_access' }): Promise<DBUser>;
  updateUser(odisId: string, data: { fullName?: string; birthDate?: Date; birthTime?: string; birthLocation?: string }): Promise<DBUser | null>;
  updateWhopProfile(whopUserId: string, data: { whopUsername?: string; whopProfilePictureUrl?: string; whopAccessLevel?: 'customer' | 'admin' | 'no_access' }): Promise<DBUser | null>;
  upgradeUserToPro(whopUserId: string, receiptId: string): Promise<DBUser | null>;
  syncProStatus(whopUserId: string, isPro: boolean, membershipId?: string | null): Promise<DBUser | null>;
  getUserByPaymentReceipt(receiptId: string): Promise<DBUser | null>;

  // Daily Energy operations
  getDailyEnergy(odisId: string, date: string): Promise<DBDailyEnergy | null>;
  saveDailyEnergy(data: Omit<DBDailyEnergy, 'id' | 'createdAt'>): Promise<DBDailyEnergy>;

  // Personality Insight operations
  getPersonalityInsight(odisId: string): Promise<DBPersonalityInsight | null>;
  savePersonalityInsight(data: Omit<DBPersonalityInsight, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBPersonalityInsight>;

  // Course Progress operations (in-memory)
  getCourseProgress(courseId: string): Promise<LessonProgress[]>;
  markLessonComplete(courseId: string, lessonId: string): Promise<void>;

  // Number Deep Report operations
  getNumberDeepReport(odisId: string, numberType: string): Promise<import("./db").DBNumberDeepReport | null>;
  saveNumberDeepReport(data: Omit<import("./db").DBNumberDeepReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBNumberDeepReport>;

  // Chat History operations
  getChatHistory(odisId: string, limit?: number): Promise<import("./db").DBChatHistory[]>;
  getChatSession(sessionId: string): Promise<import("./db").DBChatHistory | null>;
  saveChatSession(data: Omit<import("./db").DBChatHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBChatHistory>;
  updateChatSession(sessionId: string, messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>): Promise<import("./db").DBChatHistory | null>;

  // Daily Journal operations
  getDailyJournal(odisId: string, date: string): Promise<import("./db").DBDailyJournal | null>;
  saveDailyJournal(data: Omit<import("./db").DBDailyJournal, 'id' | 'createdAt'>): Promise<import("./db").DBDailyJournal>;
  getJournalEntries(odisId: string, limit?: number): Promise<import("./db").DBDailyJournal[]>;

  // Goal operations
  getGoals(odisId: string, status?: string): Promise<import("./db").DBGoal[]>;
  getGoal(goalId: string): Promise<import("./db").DBGoal | null>;
  createGoal(data: Omit<import("./db").DBGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBGoal>;
  updateGoal(goalId: string, data: Partial<Omit<import("./db").DBGoal, 'id' | 'createdAt' | 'odisId'>>): Promise<import("./db").DBGoal | null>;
  deleteGoal(goalId: string): Promise<boolean>;

  // Saved Insight operations
  getSavedInsights(odisId: string, limit?: number): Promise<import("./db").DBSavedInsight[]>;
  saveInsight(data: Omit<import("./db").DBSavedInsight, 'id' | 'createdAt'>): Promise<import("./db").DBSavedInsight>;
  deleteInsight(insightId: string): Promise<boolean>;

  // Relationship operations
  getRelationships(odisId: string): Promise<import("./db").DBRelationship[]>;
  getRelationship(relationshipId: string): Promise<import("./db").DBRelationship | null>;
  createRelationship(data: Omit<import("./db").DBRelationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBRelationship>;
  updateRelationship(relationshipId: string, data: Partial<Omit<import("./db").DBRelationship, 'id' | 'createdAt' | 'odisId'>>): Promise<import("./db").DBRelationship | null>;
  deleteRelationship(relationshipId: string): Promise<boolean>;

  // User Streak operations
  getUserStreak(odisId: string): Promise<import("./db").DBUserStreak | null>;
  updateStreak(odisId: string): Promise<import("./db").DBUserStreak>;
}

function generateOdisId(): string {
  return `odis_${crypto.randomUUID()}`;
}

export { generateOdisId };

export class MongoStorage implements IStorage {
  private initialized = false;
  // In-memory progress storage: Map<courseId, Set<completedLessonIds>>
  private progressStore: Map<string, Set<string>> = new Map();

  private async ensureConnected(): Promise<boolean> {
    if (!this.initialized) {
      this.initialized = await connectDB();
    }
    return this.initialized;
  }

  // User operations
  async getUserByOdisId(odisId: string): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const user = await UserModel.findOne({ odisId });
      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error getting user:", error);
      return null;
    }
  }

  async getUserByWhopId(whopUserId: string): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const user = await UserModel.findOne({ whopUserId });
      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error getting user by Whop ID:", error);
      return null;
    }
  }

  async createUser(data: { odisId: string; fullName: string; birthDate: Date; birthTime?: string; birthLocation?: string; whopUserId?: string; whopUsername?: string; whopProfilePictureUrl?: string; whopAccessLevel?: 'customer' | 'admin' | 'no_access' }): Promise<DBUser> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const user = await UserModel.create({
        odisId: data.odisId,
        whopUserId: data.whopUserId,
        whopUsername: data.whopUsername,
        whopProfilePictureUrl: data.whopProfilePictureUrl,
        whopAccessLevel: data.whopAccessLevel,
        fullName: data.fullName,
        birthDate: data.birthDate,
        birthTime: data.birthTime,
        birthLocation: data.birthLocation,
      });

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async updateUser(odisId: string, data: { fullName?: string; birthDate?: Date; birthTime?: string; birthLocation?: string }): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const updateFields: any = { ...data, updatedAt: new Date() };
      // Ensure birthTime is explicitly handled if provided
      if (data.birthTime !== undefined) {
        updateFields.birthTime = data.birthTime;
      }

      const user = await UserModel.findOneAndUpdate(
        { odisId },
        { $set: updateFields },
        { new: true }
      );

      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async updateWhopProfile(whopUserId: string, data: { whopUsername?: string; whopProfilePictureUrl?: string; whopAccessLevel?: 'customer' | 'admin' | 'no_access' }): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      // Filter out undefined values to prevent overwriting existing data
      const updateData: Record<string, unknown> = { updatedAt: new Date() };
      if (data.whopUsername !== undefined) updateData.whopUsername = data.whopUsername;
      if (data.whopProfilePictureUrl !== undefined) updateData.whopProfilePictureUrl = data.whopProfilePictureUrl;
      if (data.whopAccessLevel !== undefined) updateData.whopAccessLevel = data.whopAccessLevel;

      const user = await UserModel.findOneAndUpdate(
        { whopUserId },
        { $set: updateData },
        { new: true }
      );

      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error updating Whop profile:", error);
      throw error;
    }
  }

  async upgradeUserToPro(whopUserId: string, receiptId: string): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const user = await UserModel.findOneAndUpdate(
        { whopUserId },
        { $set: { isPro: true, proPaymentReceiptId: receiptId, updatedAt: new Date() } },
        { new: true }
      );

      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error upgrading user to Pro:", error);
      throw error;
    }
  }

  async syncProStatus(whopUserId: string, isPro: boolean, membershipId?: string | null): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const updateData: any = {
        isPro,
        updatedAt: new Date()
      };

      if (membershipId !== undefined) {
        updateData.proPaymentReceiptId = membershipId;
      }

      const user = await UserModel.findOneAndUpdate(
        { whopUserId },
        { $set: updateData },
        { new: true }
      );

      if (!user) return null;

      console.log(`[Storage] Synced Pro status for user ${whopUserId}: isPro=${isPro}, membershipId=${membershipId || 'none'}`);

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error syncing Pro status:", error);
      throw error;
    }
  }

  async getUserByPaymentReceipt(receiptId: string): Promise<DBUser | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const user = await UserModel.findOne({ proPaymentReceiptId: receiptId });
      if (!user) return null;

      return {
        id: user._id.toString(),
        odisId: user.odisId,
        whopUserId: user.whopUserId,
        whopUsername: user.whopUsername,
        whopProfilePictureUrl: user.whopProfilePictureUrl,
        whopAccessLevel: user.whopAccessLevel,
        fullName: user.fullName,
        birthDate: user.birthDate,
        birthTime: user.birthTime,
        birthLocation: user.birthLocation,
        isPro: user.isPro ?? false,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    } catch (error) {
      console.error("Error getting user by payment receipt:", error);
      return null;
    }
  }

  // Daily Energy operations
  async getDailyEnergy(odisId: string, date: string): Promise<DBDailyEnergy | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const energy = await DailyEnergyModel.findOne({ odisId, date });
      if (!energy) return null;

      return {
        id: energy._id.toString(),
        odisId: energy.odisId,
        date: energy.date,
        personalDayNumber: energy.personalDayNumber,
        universalDayNumber: energy.universalDayNumber,
        energyScore: energy.energyScore,
        theme: energy.theme,
        description: energy.description,
        dos: energy.dos,
        donts: energy.donts,
        focusArea: energy.focusArea,
        affirmation: energy.affirmation,
        createdAt: energy.createdAt,
      };
    } catch (error) {
      console.error("Error getting daily energy:", error);
      return null;
    }
  }

  async saveDailyEnergy(data: Omit<DBDailyEnergy, 'id' | 'createdAt'>): Promise<DBDailyEnergy> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const energy = await DailyEnergyModel.findOneAndUpdate(
        { odisId: data.odisId, date: data.date },
        { $set: data },
        { upsert: true, new: true }
      );

      return {
        id: energy._id.toString(),
        odisId: energy.odisId,
        date: energy.date,
        personalDayNumber: energy.personalDayNumber,
        universalDayNumber: energy.universalDayNumber,
        energyScore: energy.energyScore,
        theme: energy.theme,
        description: energy.description,
        dos: energy.dos,
        donts: energy.donts,
        focusArea: energy.focusArea,
        affirmation: energy.affirmation,
        createdAt: energy.createdAt,
      };
    } catch (error) {
      console.error("Error saving daily energy:", error);
      throw error;
    }
  }

  // Personality Insight operations
  async getPersonalityInsight(odisId: string): Promise<DBPersonalityInsight | null> {
    const connected = await this.ensureConnected();
    if (!connected) {
      return null;
    }

    try {
      const insight = await PersonalityInsightModel.findOne({ odisId }).sort({ createdAt: -1 });
      if (!insight) return null;

      return {
        id: insight._id.toString(),
        odisId: insight.odisId,
        overview: insight.overview,
        strengths: insight.strengths,
        challenges: insight.challenges,
        lifeLesson: insight.lifeLesson,
        careerPaths: insight.careerPaths,
        relationshipStyle: insight.relationshipStyle,
        spiritualGifts: insight.spiritualGifts,
        profileSnapshot: insight.profileSnapshot || {},
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      };
    } catch (error) {
      console.error("Error getting personality insight:", error);
      return null;
    }
  }

  async savePersonalityInsight(data: Omit<DBPersonalityInsight, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBPersonalityInsight> {
    const connected = await this.ensureConnected();
    if (!connected) {
      throw new Error("Database not connected");
    }

    try {
      const insight = await PersonalityInsightModel.findOneAndUpdate(
        { odisId: data.odisId },
        { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
      );

      return {
        id: insight._id.toString(),
        odisId: insight.odisId,
        overview: insight.overview,
        strengths: insight.strengths,
        challenges: insight.challenges,
        lifeLesson: insight.lifeLesson,
        careerPaths: insight.careerPaths,
        relationshipStyle: insight.relationshipStyle,
        spiritualGifts: insight.spiritualGifts,
        profileSnapshot: insight.profileSnapshot || {},
        createdAt: insight.createdAt,
        updatedAt: insight.updatedAt,
      };
    } catch (error) {
      console.error("Error saving personality insight:", error);
      throw error;
    }
  }

  // Course Progress operations (in-memory)
  async getCourseProgress(courseId: string): Promise<LessonProgress[]> {
    const completedLessons = this.progressStore.get(courseId);
    if (!completedLessons) {
      return [];
    }
    return Array.from(completedLessons).map(lessonId => ({
      lessonId,
      completed: true,
    }));
  }

  async markLessonComplete(courseId: string, lessonId: string): Promise<void> {
    if (!this.progressStore.has(courseId)) {
      this.progressStore.set(courseId, new Set());
    }
    this.progressStore.get(courseId)!.add(lessonId);
  }

  // Number Deep Report operations
  async getNumberDeepReport(odisId: string, numberType: string): Promise<import("./db").DBNumberDeepReport | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { NumberDeepReportModel } = await import("./db");
      const report = await NumberDeepReportModel.findOne({ odisId, numberType });
      if (!report) return null;

      return {
        id: report._id.toString(),
        odisId: report.odisId,
        numberType: report.numberType,
        numberValue: report.numberValue,
        overview: report.overview,
        uniqueExpression: report.uniqueExpression,
        dailyLife: report.dailyLife,
        superpower: report.superpower,
        shadowSide: report.shadowSide,
        famousExamples: report.famousExamples,
        thisYear: report.thisYear,
        actionSteps: report.actionSteps,
        journalPrompts: report.journalPrompts,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      };
    } catch (error) {
      console.error("Error getting number deep report:", error);
      return null;
    }
  }

  async saveNumberDeepReport(data: Omit<import("./db").DBNumberDeepReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBNumberDeepReport> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { NumberDeepReportModel } = await import("./db");
      const report = await NumberDeepReportModel.findOneAndUpdate(
        { odisId: data.odisId, numberType: data.numberType },
        { $set: { ...data, updatedAt: new Date() }, $setOnInsert: { createdAt: new Date() } },
        { upsert: true, new: true }
      );

      return {
        id: report._id.toString(),
        odisId: report.odisId,
        numberType: report.numberType,
        numberValue: report.numberValue,
        overview: report.overview,
        uniqueExpression: report.uniqueExpression,
        dailyLife: report.dailyLife,
        superpower: report.superpower,
        shadowSide: report.shadowSide,
        famousExamples: report.famousExamples,
        thisYear: report.thisYear,
        actionSteps: report.actionSteps,
        journalPrompts: report.journalPrompts,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      };
    } catch (error) {
      console.error("Error saving number deep report:", error);
      throw error;
    }
  }

  // Chat History operations
  async getChatHistory(odisId: string, limit: number = 50): Promise<import("./db").DBChatHistory[]> {
    const connected = await this.ensureConnected();
    if (!connected) return [];

    try {
      const { ChatHistoryModel } = await import("./db");
      const sessions = await ChatHistoryModel.find({ odisId }).sort({ updatedAt: -1 }).limit(limit);

      return sessions.map(session => ({
        id: session._id.toString(),
        odisId: session.odisId,
        sessionId: session.sessionId,
        messages: session.messages,
        mode: session.mode,
        tags: session.tags,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting chat history:", error);
      return [];
    }
  }

  async getChatSession(sessionId: string): Promise<import("./db").DBChatHistory | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { ChatHistoryModel } = await import("./db");
      const session = await ChatHistoryModel.findOne({ sessionId });
      if (!session) return null;

      return {
        id: session._id.toString(),
        odisId: session.odisId,
        sessionId: session.sessionId,
        messages: session.messages,
        mode: session.mode,
        tags: session.tags,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error("Error getting chat session:", error);
      return null;
    }
  }

  async saveChatSession(data: Omit<import("./db").DBChatHistory, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBChatHistory> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { ChatHistoryModel } = await import("./db");
      const session = await ChatHistoryModel.create({ ...data, createdAt: new Date(), updatedAt: new Date() });

      return {
        id: session._id.toString(),
        odisId: session.odisId,
        sessionId: session.sessionId,
        messages: session.messages,
        mode: session.mode,
        tags: session.tags,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error("Error saving chat session:", error);
      throw error;
    }
  }

  async updateChatSession(sessionId: string, messages: Array<{ role: 'user' | 'assistant'; content: string; timestamp: Date }>): Promise<import("./db").DBChatHistory | null> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { ChatHistoryModel } = await import("./db");
      const session = await ChatHistoryModel.findOneAndUpdate(
        { sessionId },
        { $set: { messages, updatedAt: new Date() } },
        { new: true }
      );

      if (!session) return null;

      return {
        id: session._id.toString(),
        odisId: session.odisId,
        sessionId: session.sessionId,
        messages: session.messages,
        mode: session.mode,
        tags: session.tags,
        title: session.title,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
      };
    } catch (error) {
      console.error("Error updating chat session:", error);
      throw error;
    }
  }

  // Daily Journal operations  
  async getDailyJournal(odisId: string, date: string): Promise<import("./db").DBDailyJournal | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { DailyJournalModel } = await import("./db");
      const journal = await DailyJournalModel.findOne({ odisId, date });
      if (!journal) return null;

      return {
        id: journal._id.toString(),
        odisId: journal.odisId,
        date: journal.date,
        mood: journal.mood,
        energyLevel: journal.energyLevel,
        activities: journal.activities,
        notes: journal.notes,
        personalDayNumber: journal.personalDayNumber,
        predictionAccuracy: journal.predictionAccuracy,
        createdAt: journal.createdAt,
      };
    } catch (error) {
      console.error("Error getting daily journal:", error);
      return null;
    }
  }

  async saveDailyJournal(data: Omit<import("./db").DBDailyJournal, 'id' | 'createdAt'>): Promise<import("./db").DBDailyJournal> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { DailyJournalModel } = await import("./db");
      const journal = await DailyJournalModel.findOneAndUpdate(
        { odisId: data.odisId, date: data.date },
        { $set: data },
        { upsert: true, new: true }
      );

      return {
        id: journal._id.toString(),
        odisId: journal.odisId,
        date: journal.date,
        mood: journal.mood,
        energyLevel: journal.energyLevel,
        activities: journal.activities,
        notes: journal.notes,
        personalDayNumber: journal.personalDayNumber,
        predictionAccuracy: journal.predictionAccuracy,
        createdAt: journal.createdAt,
      };
    } catch (error) {
      console.error("Error saving daily journal:", error);
      throw error;
    }
  }

  async getJournalEntries(odisId: string, limit: number = 30): Promise<import("./db").DBDailyJournal[]> {
    const connected = await this.ensureConnected();
    if (!connected) return [];

    try {
      const { DailyJournalModel } = await import("./db");
      const entries = await DailyJournalModel.find({ odisId }).sort({ date: -1 }).limit(limit);

      return entries.map(journal => ({
        id: journal._id.toString(),
        odisId: journal.odisId,
        date: journal.date,
        mood: journal.mood,
        energyLevel: journal.energyLevel,
        activities: journal.activities,
        notes: journal.notes,
        personalDayNumber: journal.personalDayNumber,
        predictionAccuracy: journal.predictionAccuracy,
        createdAt: journal.createdAt,
      }));
    } catch (error) {
      console.error("Error getting journal entries:", error);
      return [];
    }
  }

  // Goal operations
  async getGoals(odisId: string, status?: string): Promise<import("./db").DBGoal[]> {
    const connected = await this.ensureConnected();
    if (!connected) return [];

    try {
      const { GoalModel } = await import("./db");
      const query: any = { odisId };
      if (status) query.status = status;

      const goals = await GoalModel.find(query).sort({ createdAt: -1 });

      return goals.map(goal => ({
        id: goal._id.toString(),
        odisId: goal.odisId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        bestDates: goal.bestDates,
        bestMonths: goal.bestMonths,
        status: goal.status,
        progress: goal.progress,
        completedAt: goal.completedAt,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting goals:", error);
      return [];
    }
  }

  async getGoal(goalId: string): Promise<import("./db").DBGoal | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { GoalModel } = await import("./db");
      const goal = await GoalModel.findById(goalId);
      if (!goal) return null;

      return {
        id: goal._id.toString(),
        odisId: goal.odisId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        bestDates: goal.bestDates,
        bestMonths: goal.bestMonths,
        status: goal.status,
        progress: goal.progress,
        completedAt: goal.completedAt,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    } catch (error) {
      console.error("Error getting goal:", error);
      return null;
    }
  }

  async createGoal(data: Omit<import("./db").DBGoal, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBGoal> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { GoalModel } = await import("./db");
      const goal = await GoalModel.create(data);

      return {
        id: goal._id.toString(),
        odisId: goal.odisId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        bestDates: goal.bestDates,
        bestMonths: goal.bestMonths,
        status: goal.status,
        progress: goal.progress,
        completedAt: goal.completedAt,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    } catch (error) {
      console.error("Error creating goal:", error);
      throw error;
    }
  }

  async updateGoal(goalId: string, data: Partial<Omit<import("./db").DBGoal, 'id' | 'createdAt' | 'odisId'>>): Promise<import("./db").DBGoal | null> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { GoalModel } = await import("./db");
      const goal = await GoalModel.findByIdAndUpdate(
        goalId,
        { $set: { ...data, updatedAt: new Date() } },
        { new: true }
      );

      if (!goal) return null;

      return {
        id: goal._id.toString(),
        odisId: goal.odisId,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        bestDates: goal.bestDates,
        bestMonths: goal.bestMonths,
        status: goal.status,
        progress: goal.progress,
        completedAt: goal.completedAt,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
      };
    } catch (error) {
      console.error("Error updating goal:", error);
      throw error;
    }
  }

  async deleteGoal(goalId: string): Promise<boolean> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { GoalModel } = await import("./db");
      const result = await GoalModel.findByIdAndDelete(goalId);
      return !!result;
    } catch (error) {
      console.error("Error deleting goal:", error);
      return false;
    }
  }

  // Saved Insight operations
  async getSavedInsights(odisId: string, limit: number = 100): Promise<import("./db").DBSavedInsight[]> {
    const connected = await this.ensureConnected();
    if (!connected) return [];

    try {
      const { SavedInsightModel } = await import("./db");
      const insights = await SavedInsightModel.find({ odisId }).sort({ createdAt: -1 }).limit(limit);

      return insights.map(insight => ({
        id: insight._id.toString(),
        odisId: insight.odisId,
        source: insight.source,
        content: insight.content,
        title: insight.title,
        category: insight.category,
        tags: insight.tags,
        createdAt: insight.createdAt,
      }));
    } catch (error) {
      console.error("Error getting saved insights:", error);
      return [];
    }
  }

  async saveInsight(data: Omit<import("./db").DBSavedInsight, 'id' | 'createdAt'>): Promise<import("./db").DBSavedInsight> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { SavedInsightModel } = await import("./db");
      const insight = await SavedInsightModel.create(data);

      return {
        id: insight._id.toString(),
        odisId: insight.odisId,
        source: insight.source,
        content: insight.content,
        title: insight.title,
        category: insight.category,
        tags: insight.tags,
        createdAt: insight.createdAt,
      };
    } catch (error) {
      console.error("Error saving insight:", error);
      throw error;
    }
  }

  async deleteInsight(insightId: string): Promise<boolean> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { SavedInsightModel } = await import("./db");
      const result = await SavedInsightModel.findByIdAndDelete(insightId);
      return !!result;
    } catch (error) {
      console.error("Error deleting insight:", error);
      return false;
    }
  }

  // Relationship operations
  async getRelationships(odisId: string): Promise<import("./db").DBRelationship[]> {
    const connected = await this.ensureConnected();
    if (!connected) return [];

    try {
      const { RelationshipModel } = await import("./db");
      const relationships = await RelationshipModel.find({ odisId }).sort({ createdAt: -1 });

      return relationships.map(rel => ({
        id: rel._id.toString(),
        odisId: rel.odisId,
        name: rel.name,
        relationshipType: rel.relationshipType,
        birthDate: rel.birthDate,
        birthTime: rel.birthTime,
        birthLocation: rel.birthLocation,
        compatibilityScore: rel.compatibilityScore,
        notes: rel.notes,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
      }));
    } catch (error) {
      console.error("Error getting relationships:", error);
      return [];
    }
  }

  async getRelationship(relationshipId: string): Promise<import("./db").DBRelationship | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { RelationshipModel } = await import("./db");
      const rel = await RelationshipModel.findById(relationshipId);
      if (!rel) return null;

      return {
        id: rel._id.toString(),
        odisId: rel.odisId,
        name: rel.name,
        relationshipType: rel.relationshipType,
        birthDate: rel.birthDate,
        birthTime: rel.birthTime,
        birthLocation: rel.birthLocation,
        compatibilityScore: rel.compatibilityScore,
        notes: rel.notes,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
      };
    } catch (error) {
      console.error("Error getting relationship:", error);
      return null;
    }
  }

  async createRelationship(data: Omit<import("./db").DBRelationship, 'id' | 'createdAt' | 'updatedAt'>): Promise<import("./db").DBRelationship> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { RelationshipModel } = await import("./db");
      const rel = await RelationshipModel.create(data);

      return {
        id: rel._id.toString(),
        odisId: rel.odisId,
        name: rel.name,
        relationshipType: rel.relationshipType,
        birthDate: rel.birthDate,
        birthTime: rel.birthTime,
        birthLocation: rel.birthLocation,
        compatibilityScore: rel.compatibilityScore,
        notes: rel.notes,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
      };
    } catch (error) {
      console.error("Error creating relationship:", error);
      throw error;
    }
  }

  async updateRelationship(relationshipId: string, data: Partial<Omit<import("./db").DBRelationship, 'id' | 'createdAt' | 'odisId'>>): Promise<import("./db").DBRelationship | null> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { RelationshipModel } = await import("./db");
      const rel = await RelationshipModel.findByIdAndUpdate(
        relationshipId,
        { $set: { ...data, updatedAt: new Date() } },
        { new: true }
      );

      if (!rel) return null;

      return {
        id: rel._id.toString(),
        odisId: rel.odisId,
        name: rel.name,
        relationshipType: rel.relationshipType,
        birthDate: rel.birthDate,
        birthTime: rel.birthTime,
        birthLocation: rel.birthLocation,
        compatibilityScore: rel.compatibilityScore,
        notes: rel.notes,
        createdAt: rel.createdAt,
        updatedAt: rel.updatedAt,
      };
    } catch (error) {
      console.error("Error updating relationship:", error);
      throw error;
    }
  }

  async deleteRelationship(relationshipId: string): Promise<boolean> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { RelationshipModel } = await import("./db");
      const result = await RelationshipModel.findByIdAndDelete(relationshipId);
      return !!result;
    } catch (error) {
      console.error("Error deleting relationship:", error);
      return false;
    }
  }

  // User Streak operations
  async getUserStreak(odisId: string): Promise<import("./db").DBUserStreak | null> {
    const connected = await this.ensureConnected();
    if (!connected) return null;

    try {
      const { UserStreakModel } = await import("./db");
      const streak = await UserStreakModel.findOne({ odisId });
      if (!streak) return null;

      return {
        id: streak._id.toString(),
        odisId: streak.odisId,
        currentStreak: streak.currentStreak,
        longestStreak: streak.longestStreak,
        lastCheckIn: streak.lastCheckIn,
        totalCheckIns: streak.totalCheckIns,
        achievements: streak.achievements,
        updatedAt: streak.updatedAt,
      };
    } catch (error) {
      console.error("Error getting user streak:", error);
      return null;
    }
  }

  async updateStreak(odisId: string): Promise<import("./db").DBUserStreak> {
    const connected = await this.ensureConnected();
    if (!connected) throw new Error("Database not connected");

    try {
      const { UserStreakModel } = await import("./db");
      const now = new Date();
      const existing = await UserStreakModel.findOne({ odisId });

      if (!existing) {
        // First check-in
        const streak = await UserStreakModel.create({
          odisId,
          currentStreak: 1,
          longestStreak: 1,
          lastCheckIn: now,
          totalCheckIns: 1,
          achievements: ['first_checkin'],
        });

        return {
          id: streak._id.toString(),
          odisId: streak.odisId,
          currentStreak: streak.currentStreak,
          longestStreak: streak.longestStreak,
          lastCheckIn: streak.lastCheckIn,
          totalCheckIns: streak.totalCheckIns,
          achievements: streak.achievements,
          updatedAt: streak.updatedAt,
        };
      }

      // Calculate if streak continues
      const lastCheckIn = existing.lastCheckIn ? new Date(existing.lastCheckIn) : new Date(0);
      const daysSinceLastCheckIn = Math.floor((now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60 * 24));

      let newStreak = existing.currentStreak;
      let achievements = [...existing.achievements];

      if (daysSinceLastCheckIn === 1) {
        // Streak continues!
        newStreak = existing.currentStreak + 1;

        // Add achievements
        if (newStreak === 7 && !achievements.includes('week_streak')) achievements.push('week_streak');
        if (newStreak === 30 && !achievements.includes('month_streak')) achievements.push('month_streak');
        if (newStreak === 100 && !achievements.includes('hundred_streak')) achievements.push('hundred_streak');
      } else if (daysSinceLastCheckIn > 1) {
        // Streak broke
        newStreak = 1;
      }
      // If daysSinceLastCheckIn === 0, they already checked in today, don't update

      const longestStreak = Math.max(existing.longestStreak, newStreak);
      const totalCheckIns = daysSinceLastCheckIn === 0 ? existing.totalCheckIns : existing.totalCheckIns + 1;

      const streak = await UserStreakModel.findOneAndUpdate(
        { odisId },
        {
          $set: {
            currentStreak: newStreak,
            longestStreak,
            lastCheckIn: daysSinceLastCheckIn === 0 ? existing.lastCheckIn : now,
            totalCheckIns,
            achievements,
            updatedAt: now,
          }
        },
        { new: true }
      );

      return {
        id: streak!._id.toString(),
        odisId: streak!.odisId,
        currentStreak: streak!.currentStreak,
        longestStreak: streak!.longestStreak,
        lastCheckIn: streak!.lastCheckIn,
        totalCheckIns: streak!.totalCheckIns,
        achievements: streak!.achievements,
        updatedAt: streak!.updatedAt,
      };
    } catch (error) {
      console.error("Error updating streak:", error);
      throw error;
    }
  }
}

export const storage = new MongoStorage();
