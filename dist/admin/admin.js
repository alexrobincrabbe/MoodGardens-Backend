import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/prisma";
import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prismaClient.js";
AdminJS.registerAdapter({ Database, Resource });
export async function setupAdminPanel(app) {
    // ---- Get DMMF safely ----
    const prismaAny = prisma;
    // Prefer the client-internal _dmmf if it exists
    let dmmf = prismaAny._dmmf ?? Prisma.dmmf;
    if (!dmmf) {
        console.warn("[Admin] Could not obtain Prisma DMMF – Admin panel disabled.");
        return;
    }
    // Build a modelMap if not present (Prisma 5+)
    let modelMap = dmmf.modelMap;
    if (!modelMap && dmmf.datamodel?.models) {
        modelMap = dmmf.datamodel.models.reduce((acc, model) => {
            acc[model.name] = model;
            return acc;
        }, {});
    }
    if (!modelMap) {
        console.warn("[Admin] DMMF has no modelMap and no datamodel.models – Admin panel disabled.");
        return;
    }
    const requiredModels = ["User", "DiaryEntry", "Garden", "UserKey"];
    for (const name of requiredModels) {
        if (!modelMap[name]) {
            console.warn(`[Admin] Model '${name}' not found in DMMF. Available models: ${Object.keys(modelMap).join(", ")}`);
        }
    }
    const admin = new AdminJS({
        rootPath: "/admin",
        resources: [
            // USER -------------------------------------------------
            {
                resource: { model: modelMap.User, client: prisma },
                options: {
                    navigation: "Core",
                    properties: {
                        // Never show the password hash anywhere
                        passwordHash: { isVisible: false },
                    },
                },
            },
            // DIARY ENTRY -----------------------------------------
            {
                resource: { model: modelMap.DiaryEntry, client: prisma },
                options: {
                    navigation: "Content",
                    // Columns shown in the list view
                    listProperties: ["id", "userId", "dayKey", "createdAt"],
                    properties: {
                        // Text: viewable in "show", but NOT editable or creatable
                        text: {
                            isVisible: {
                                list: false, // don't show full text in list
                                filter: false, // don't filter by it
                                show: true, // can view details
                                edit: false, // cannot edit
                            },
                        },
                        // Encryption-related fields: completely hidden
                        iv: { isVisible: false },
                        authTag: { isVisible: false },
                        ciphertext: { isVisible: false },
                    },
                },
            },
            // GARDEN ----------------------------------------------
            {
                resource: { model: modelMap.Garden, client: prisma },
                options: {
                    navigation: "Content",
                    listProperties: ["id", "userId", "period", "periodKey", "status", "createdAt"],
                },
            },
            // USER KEY (very sensitive) ---------------------------
            {
                resource: { model: modelMap.UserKey, client: prisma },
                options: {
                    navigation: "Security",
                    properties: {
                        // Encrypted data key: never visible in the admin
                        edek: { isVisible: false },
                    },
                },
            },
        ],
        branding: {
            companyName: "Mood Gardens",
            logo: false,
        },
    });
    // ---- Auth for /admin ----
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
    const COOKIE_SECRET = process.env.ADMIN_COOKIE_SECRET ?? "dev-moodgardens-admin-cookie-secret";
    const router = AdminJSExpress.buildAuthenticatedRouter(admin, {
        authenticate: async (email, password) => {
            if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
                console.warn("[Admin] ADMIN_EMAIL/ADMIN_PASSWORD not set – rejecting all logins.");
                return null;
            }
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                return { email };
            }
            return null;
        },
        cookieName: "moodgardens_admin",
        cookiePassword: COOKIE_SECRET,
    }, null, {
        secret: COOKIE_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            secure: process.env.NODE_ENV === "production",
        },
    });
    app.use(admin.options.rootPath, router);
    console.log(`[Admin] AdminJS mounted at ${admin.options.rootPath}`);
}
