import { PrismaClient } from "@prisma/client";
import { Services } from "./services.js";
import { createRegisterMutation, createLoginMutation, createLoginWithGoogleMutation, createLogoutMutation } from "./resolvers/users/auth.js";
import { createCreateDiaryEntryMutation } from "./resolvers/diary/entries.js";
import { createUpdateUserSettingsMutation, createUpdateUserProfileMutation, createChangePasswordMutation } from "./resolvers/users/userProfile.js";
import { createRegenerateGardenMutation, createRequestGenerateGardenMutation } from "./resolvers/gardens/gardens.js";
import { createResetPasswordMutation, createRequestPasswordResetMutation, createVerifyEmailMutation } from "./resolvers/users/mail.js";
import { createMarkUserPremiumFromMobileMutation, createAddRegenTokensFromMobileMutation } from "./resolvers/users/premium.js";

export function createMutations(services: Services) {
    return {
        //auth
        register: createRegisterMutation(services),
        login: createLoginMutation(services),
        loginWithGoogle: createLoginWithGoogleMutation(services),
        logout: createLogoutMutation(services),
        //Email
        requestPasswordReset: createRequestPasswordResetMutation(services),
        resetPassword: createResetPasswordMutation(services),
        verifyEmail: createVerifyEmailMutation(services),
        //Diary Entries
        createDiaryEntry: createCreateDiaryEntryMutation(services),
        //Gardens
        requestGenerateGarden: createRequestGenerateGardenMutation(services),
        regenerateGarden: createRegenerateGardenMutation(services),
        //User Profile
        updateUserSettings: createUpdateUserSettingsMutation(services),
        updateUserProfile: createUpdateUserProfileMutation(services),
        changePassword: createChangePasswordMutation(services),
        //Premium
        markUserPremiumFromMobile: createMarkUserPremiumFromMobileMutation(services),
        addRegenTokensFromMobile: createAddRegenTokensFromMobileMutation(services),
    };
}
