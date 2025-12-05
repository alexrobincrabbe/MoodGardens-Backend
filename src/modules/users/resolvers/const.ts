export const UserPublicFields = {
    id: true,
    email: true,
    isPremium: true,
    premiumSince:true,
    regenerateTokens:true,
    displayName: true,
    createdAt: true,
    timezone: true,
    dayRolloverHour: true,
    notifyWeeklyGarden: true,
    notifyMonthlyGarden: true,
    notifyYearlyGarden: true,
} as const;