import { type PrismaClient} from "@prisma/client";
import { createUserQuery } from "../modules/users/resolvers/auth.js";
import { createDairyEntryQuery, createPaginatedEntriesQuery, createCurrentDayKeyQuery } from "../modules/diary/resolvers/diaryEntries.js";
import { createGardenQuery, createGardensByPeriodQuery, createGardensByMonthQuery } from "../modules/gardens/resolvers/gardens.js";


export function createQueries(prisma: PrismaClient) {
    return (
        {   
            //auth
            user: createUserQuery(prisma),
            //Diary entries
            diaryEntry: createDairyEntryQuery(prisma),
            paginatedDiaryEntries: createPaginatedEntriesQuery(prisma),
            currentDiaryDayKey:createCurrentDayKeyQuery(prisma),
            //Gardens
            garden: createGardenQuery(prisma),
            gardensByPeriod: createGardensByPeriodQuery(prisma),
            gardensByMonth: createGardensByMonthQuery(prisma),
        }
    )
}
