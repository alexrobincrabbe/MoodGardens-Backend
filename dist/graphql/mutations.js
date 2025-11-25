import { createRegisterMutation, createLoginMutation, createLoginWithGoogleMutation, createLogoutMutation } from "../modules/users/resolvers/auth.js";
import { createCreateDiaryEntryMutation } from "../modules/diary/resolvers/diaryEntries.js";
import { createUpdateUserSettingsMutation, createUpdateUserProfileMutation, createChangePasswordMutation } from "../modules/users/resolvers/userProfile.js";
import { createRequestGenerateGardenMutation } from "../modules/gardens/resolvers/gardens.js";
export function createMutations(prisma) {
    return ({
        //auth
        register: createRegisterMutation(prisma),
        login: createLoginMutation(prisma),
        loginWithGoogle: createLoginWithGoogleMutation(prisma),
        logout: createLogoutMutation(prisma),
        //Diary Entries
        createDiaryEntry: createCreateDiaryEntryMutation(prisma),
        //Gardens
        requestGenerateGarden: createRequestGenerateGardenMutation(prisma),
        //User Profile
        updateUserSettings: createUpdateUserSettingsMutation(prisma),
        updateUserProfile: createUpdateUserProfileMutation(prisma),
        changePassword: createChangePasswordMutation(prisma),
    });
}
