// src/admin/admin.ts
import type { Express } from "express";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource, getModelByName } from "@adminjs/prisma";
import { Prisma } from "@prisma/client";
import session from "express-session";
import { prisma } from "../lib/prismaClient.js";
import { componentLoader, Components } from './components.js'

AdminJS.registerAdapter({ Database, Resource });

export async function setupAdminPanel(app: Express) {
    const prismaAny = prisma as any;
    let dmmf: any = prismaAny._dmmf ?? (Prisma as any).dmmf;
    if (!dmmf) {
        console.warn("[Admin] Could not obtain Prisma DMMF – Admin panel disabled.");
        return;
    }
    let modelMap: Record<string, any> | undefined = dmmf.modelMap;
    if (!modelMap && dmmf.datamodel?.models) {
        modelMap = dmmf.datamodel.models.reduce(
            (acc: Record<string, any>, model: any) => {
                acc[model.name] = model;
                return acc;
            },
            {}
        );
    }

    if (!modelMap) {
        console.warn(
            "[Admin] DMMF has no modelMap and no datamodel.models – Admin panel disabled."
        );
        return;
    }

    const requiredModels = ["User", "DiaryEntry", "Garden", "UserKey"];

    for (const name of requiredModels) {
        if (!modelMap[name]) {
            console.warn(
                `[Admin] Model '${name}' not found in DMMF. Available models: ${Object.keys(
                    modelMap
                ).join(", ")}`
            );
        }
    }

    const admin = new AdminJS({
        rootPath: "/admin",
        componentLoader, // the loader needs to be added here
        resources: [
            // USER -------------------------------------------------
            {
                resource: { model: modelMap.User, client: prisma },
                options: {
                    navigation: "Authentication",
                    properties: {
                        passwordHash: { isVisible: false },
                    },
                    sort: {
                        sortBy: "createdAt",
                        direction: "desc",
                    },
                    listProperties: ["email", "createdAt", "id", "emailVerified", "isPremium", "timezone"],
                    showProperties: ["email", "id", "emailVerified", "isPremium", "createdAt", "displayName","timezone", "dayRolloverHour", "notifyWeeklyGarden"]
                },
            },

            // DIARY ENTRY -----------------------------------------
            {
                resource: { model: modelMap.DiaryEntry, client: prisma },
                options: {
                    sort: {
                        sortBy: "createdAt",
                        direction: "desc",
                    },
                    navigation: "Content",
                    properties: {
                        // Text: viewable in "show", but NOT editable or creatable
                        text: {
                            isVisible: {
                                list: false,   // don't show full text in list
                                filter: false, // don't filter by it
                                show: true,    // can view details
                                edit: false,   // cannot edit
                            },
                        },
                        iv: { isVisible: false },
                        authTag: { isVisible: false },
                        ciphertext: { isVisible: false },
                    },
                    listProperties: ["createdAt", "user","dayKey"],
                    showProperties: ["user", "id", "createdAt", "dayKey",]
                },

            },

            // GARDEN ----------------------------------------------
            {
                resource: { model: getModelByName("Garden"), client: prisma },
                options: {
                    navigation: "Content",
                    sort: {
                        sortBy: "createdAt",
                        direction: "desc",
                    },
                    properties: {
                        imageUrl: {
                            type: "string",
                            components: {
                                show: Components.GardenImage,
                            },
                        },
                        secondaryEmotions: {
                            type: "string",
                            isArray: true,
                            isVisible: {
                                list: true,
                                show: true,
                                filter: true,
                                edit: false, // read-only
                            },
                        },
                    },
                    listProperties: [
                        "createdAt",
                        "user",
                        "period",
                        "periodKey",
                        "primaryEmotion",
                        "intensity",
                        "earnestness",
                        "status",
                    ],
                    showProperties: [
                        "imageUrl",
                        "prompt",
                        "user",
                        "id",
                        "createdAt",
                        "valence",
                        "primaryEmotion",
                        "secondaryEmotions",
                        "intensity",
                        "normalisedIntensity",
                        "intensityBand",
                        "archetype",
                        "earnestness",
                       
                       
                    ],
                },
            },

            // USER KEY (very sensitive) ---------------------------
            {
                resource: { model: modelMap.UserKey, client: prisma },
                options: {
                    navigation: "Encryption",
                    properties: {
                        // Encrypted data key: never visible in the admin
                        edek: { isVisible: false },
                    },
                    listProperties: ["user", "createdAt"],
                    showProperties: ["user", "id", "createdAt", "keyId", "version",]
                },
            },
        ],
        branding: {
            companyName: "My Mood Gardens",
            logo: false,
        },
    });


    // ---- Auth for /admin ----
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const COOKIE_SECRET =
        process.env.ADMIN_COOKIE_SECRET ?? "dev-moodgardens-admin-cookie-secret";

    const router = AdminJSExpress.buildAuthenticatedRouter(
        admin,
        {
            authenticate: async (email, password) => {
                if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
                    console.warn(
                        "[Admin] ADMIN_EMAIL/ADMIN_PASSWORD not set – rejecting all logins."
                    );
                    return null;
                }
                if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                    return { email };
                }
                return null;
            },
            cookieName: "moodgardens_admin",
            cookiePassword: COOKIE_SECRET,
        },
        null,
        {
            secret: COOKIE_SECRET,
            resave: false,
            saveUninitialized: false,
            cookie: {
                secure: process.env.NODE_ENV === "production",
            },
        } as session.SessionOptions
    );

    app.use(admin.options.rootPath, router);
    console.log(`[Admin] AdminJS mounted at ${admin.options.rootPath}`);
}
