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
  }

  type Entry {
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
    me: User
    garden(period: GardenPeriod!, periodKey: String!): Garden
    myEntries(limit: Int!, offset: Int!): [Entry!]!
    entryByDay(dayKey: String!): Entry
    myGardensByMonth(monthKey: String!): [Garden!]!
  }

  type Mutation {
    register(email: String!, password: String!, displayName: String!): AuthPayload!
    login(email: String!, password: String!): AuthPayload!
    logout: Boolean!
    upsertEntry(text: String!, songUrl: String, dayKey: String!): Entry!
    requestGarden(period: GardenPeriod!, periodKey: String!): Garden!
    updateDisplayName(displayName: String!): User!
  }
`;
