import { type PrismaClient } from "@prisma/client";
import { GardenService } from "../modules/gardens/services/gardenService.js";
import { AuthService } from "../auth/services/authService.js";
import { UserService } from "../auth/services/userService.js";
import { UserRepository } from "../auth/repositories/userRepository.js";
import { DiaryRepository } from "../modules/diary/repositories/diaryRepository.js";
import { DiaryService } from "../modules/diary/services/diaryService.js";

/**
 * Service container that holds all services and repositories
 * Created once and passed to resolvers via dependency injection
 */
export class Services {
    public readonly gardenService: GardenService;
    public readonly authService: AuthService;
    public readonly userService: UserService;
    public readonly diaryService: DiaryService;
    public readonly userRepository: UserRepository;
    public readonly diaryRepository: DiaryRepository;
    public readonly prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
        // Create all services once
        this.gardenService = new GardenService(prisma);
        this.authService = new AuthService(prisma);
        this.userService = new UserService(prisma);
        this.diaryService = new DiaryService(prisma);
        this.userRepository = new UserRepository(prisma);
        this.diaryRepository = new DiaryRepository(prisma);
    }
}

