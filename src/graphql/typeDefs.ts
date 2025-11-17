// apps/api/src/graphql/typeDefs.ts



export const typeDefs = `#graphql
  scalar JSON

  enum GardenPeriod { DAY WEEK MONTH YEAR }
  enum GardenStatus { PENDING READY FAILED }

  type Mood {
    valence: Float!
    arousal: Float!
    emotions: [KeyVal!]!
    tags: [String!]!
  }
  type KeyVal { key: String!, val: Float! }

  type User {
    id: ID!
    email: String!
    createdAt: String!
    displayName: String!
    timezone: String!
    dayRolloverHour: Int!
    notifyWeeklyGarden: Boolean!
    notifyMonthlyGarden: Boolean!
    notifyYearlyGarden: Boolean!
  }

  type AuthPayload {
  token: String!
  user: User!
}

  type DiaryEntry {
    id: ID!
    text: String!
    dayKey: String!
    createdAt: String!
    mood: Mood!
    garden: Garden
  }

  type Garden {
    id: ID!
    period: GardenPeriod!
    periodKey: String!
    status: GardenStatus!
    imageUrl: String
    publicId: String
    palette: JSON
    seedValue: Int!
    summary: String
    progress: Int!
    shareUrl: String
    createdAt: String!
    updatedAt: String!
  }

  type AuthPayload {
    user: User!
  }

  type Query {
    user: User
    garden(period: GardenPeriod!, periodKey: String!): Garden
    paginatedDiaryEntries(limit: Int!, offset: Int!): [DiaryEntry!]!
    diaryEntry(dayKey: String!): DiaryEntry
    gardensByMonth(monthKey: String!): [Garden!]!
    currentDiaryDayKey: String!
  }

  type Mutation {
    register(email: String!, password: String!, displayName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    createDiaryEntry(text: String!): DiaryEntry!
    requestGenerateGarden(period: GardenPeriod!, periodKey: String): Garden!
    updateDisplayName(displayName: String!): User!
    updateUserSettings(timezone: String!, dayRolloverHour: Int!): User!
    updateUserProfile(email: String!, displayName: String!): User!
    changePassword(currentPassword: String!, newPassword: String!): Boolean!
    requestPasswordReset(email: String!): Boolean!
    loginWithGoogle(idToken: String!): AuthPayload!
  }
`;
