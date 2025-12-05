import { PrismaClient } from "@prisma/client";
import { createRegisterMutation, createLoginMutation, createLoginWithGoogleMutation, createLogoutMutation } from "../modules/users/resolvers/auth.js";
import { createCreateDiaryEntryMutation } from "../modules/diary/resolvers/diaryEntries.js";
import { createUpdateUserSettingsMutation, createUpdateUserProfileMutation, createChangePasswordMutation } from "../modules/users/resolvers/userProfile.js";
import { createRequestGenerateGardenMutation } from "../modules/gardens/resolvers/gardens.js";
import { createResetPasswordMutation, createRequestPasswordResetMutation, createVerifyEmailMutation } from "../modules/users/resolvers/mail.js";
import { createMarkUserPremiumFromMobileMutation, createAddRegenTokensFromMobileMutation } from "../modules/users/resolvers/premium.js";

type UpdateDisplayNameArgs = { displayName: string };

export function createMutations(prisma: PrismaClient) {
    return (
        {
            //auth
            register: createRegisterMutation(prisma),
            login: createLoginMutation(prisma),
            loginWithGoogle: createLoginWithGoogleMutation(prisma),
            logout: createLogoutMutation(prisma),
            //Email
            requestPasswordReset: createRequestPasswordResetMutation(prisma),
            resetPassword: createResetPasswordMutation(prisma),
            verifyEmail: createVerifyEmailMutation(prisma),
            //Diary Entries
            createDiaryEntry: createCreateDiaryEntryMutation(prisma),
            //Gardens
            requestGenerateGarden: createRequestGenerateGardenMutation(prisma),
            //User Profile
            updateUserSettings: createUpdateUserSettingsMutation(prisma),
            updateUserProfile: createUpdateUserProfileMutation(prisma),
            changePassword: createChangePasswordMutation(prisma),
            //Premium
            // in createMutations(prisma)
            markUserPremiumFromMobile: createMarkUserPremiumFromMobileMutation(prisma),
            addRegenTokensFromMobile: createAddRegenTokensFromMobileMutation(prisma),
        }
    )
}