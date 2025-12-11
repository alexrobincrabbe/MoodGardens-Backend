import { GardenPeriod, GardenType } from "@prisma/client";

// Auth resolver argument types
export type RegisterArgs = {
    email: string;
    displayName: string;
    password: string;
};

export type LoginArgs = {
    email: string;
    password: string;
};

export type LoginWithGoogleArgs = {
    idToken: string;
};

// User profile resolver argument types
export type UpdateUserSettingsArgs = {
    timezone: string;
    dayRolloverHour: number;
};

export type UpdateProfileArgs = {
    email: string;
    displayName: string;
};

export type ChangePasswordArgs = {
    currentPassword: string;
    newPassword: string;
};

// Email resolver argument types
export type RequestPasswordResetArgs = {
    email: string;
};

export type ResetPasswordArgs = {
    token: string;
    newPassword: string;
};

export type VerifyEmailArgs = {
    token: string;
};

// Diary resolver argument types
export type CreateDiaryEntryArgs = {
    text: string;
};

export type DiaryEntryQueryArgs = {
    dayKey: string;
};

export type PaginatedDiaryEntriesArgs = {
    limit: number;
    offset: number;
};

// Garden resolver argument types
export type GardenQueryArgs = {
    period: GardenPeriod;
    periodKey: string;
};

export type GardenPeriodQueryArgs = {
    period: GardenPeriod;
};

export type GardensByMonthArgs = {
    monthKey: string;
};

export type GardenArgs = {
    period: GardenPeriod;
    periodKey: string;
    gardenType: GardenType;
};

export type RegenerateGardenArgs = {
    gardenId: string;
};

// Premium resolver argument types
export type AddRegenTokensArgs = {
    amount: number;
};

// GraphQL resolver parent types
export type DiaryEntryParent = {
    dayKey: string;
};

