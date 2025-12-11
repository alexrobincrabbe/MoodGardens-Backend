import { Services } from "./services.js";
import { createUserQuery } from "./resolvers/users/auth.js";
import { createDairyEntryQuery, createPaginatedEntriesQuery, createCurrentDayKeyQuery } from "./resolvers/diary/entries.js";
import { createGardenQuery, createGardensByPeriodQuery, createGardensByMonthQuery } from "./resolvers/gardens/gardens.js";

export function createQueries(services: Services) {
    return {
        //auth
        user: createUserQuery(services),
        //Diary entries
        diaryEntry: createDairyEntryQuery(services),
        paginatedDiaryEntries: createPaginatedEntriesQuery(services),
        currentDiaryDayKey: createCurrentDayKeyQuery(services),
        //Gardens
        garden: createGardenQuery(services),
        gardensByPeriod: createGardensByPeriodQuery(services),
        gardensByMonth: createGardensByMonthQuery(services),
    };
}
