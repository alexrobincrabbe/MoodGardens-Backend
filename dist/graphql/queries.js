import { createUserQuery } from "./auth.js";
import { createDairyEntryQuery, createPaginatedEntriesQuery, createCurrentDayKeyQuery } from "./diaryEntries.js";
import { createGardenQuery, createGardensByPeriodQuery, createGardensByMonthQuery } from "./gardens.js";
export function createQueries(prisma) {
    return ({
        user: createUserQuery(prisma),
        //Diary entries
        diaryEntry: createDairyEntryQuery(prisma),
        paginatedDiaryEntries: createPaginatedEntriesQuery(prisma),
        currentDiaryDayKey: createCurrentDayKeyQuery(prisma),
        //Gardens
        garden: createGardenQuery(prisma),
        gardensByPeriod: createGardensByPeriodQuery(prisma),
        gardensByMonth: createGardensByMonthQuery(prisma),
    });
}
