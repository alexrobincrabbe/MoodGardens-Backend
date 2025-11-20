import { createRegisterMutation, createLoginMutation, createLoginWithGoogleMutation, createLogoutMutation } from "./auth.js";
import { createCreateDiaryEntryMutation } from "./diaryEntries.js";
import { createUpdateUserSettingsMutation, createUpdateUserProfileMutation, createChangePasswordMutation } from "./userProfile.js";
import { createRequestGenerateGardenMutation } from "./gardens.js";
export function createMutations(prisma) {
    return ({
        //auth
        register: createRegisterMutation(prisma),
        login: createLoginMutation(prisma),
        loginWithGoogle: createLoginWithGoogleMutation(prisma),
        logout: createLogoutMutation(prisma),
        //Diary Entries
        createDiaryEntry: createCreateDiaryEntryMutation(prisma),
        //User Profile
        updateUserSettings: createUpdateUserSettingsMutation(prisma),
        updateUserProfile: createUpdateUserProfileMutation(prisma),
        changePassword: createChangePasswordMutation(prisma),
        //Gardens
        requestGenerateGarden: createRequestGenerateGardenMutation(prisma),
    });
}
