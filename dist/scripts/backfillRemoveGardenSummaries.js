import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function removePlaintextGardenSummaries() {
    console.log("🧹 Starting plaintext garden summary removal…");
    const countEligible = await prisma.garden.count({
        where: {
            summary: { not: "" },
            summaryIv: { not: null },
            summaryAuthTag: { not: null },
            summaryCiphertext: { not: null },
        },
    });
    console.log(`Found ${countEligible} gardens eligible for summary removal.`);
    if (countEligible === 0) {
        console.log("Nothing to do — all garden summaries already blank.");
        return;
    }
    const batchSize = 100;
    let processed = 0;
    for (;;) {
        const gardens = await prisma.garden.findMany({
            where: {
                summary: { not: "" },
                summaryIv: { not: null },
                summaryAuthTag: { not: null },
                summaryCiphertext: { not: null },
            },
            take: batchSize,
            select: { id: true },
        });
        if (gardens.length === 0)
            break;
        console.log(`Processing batch of ${gardens.length} gardens…`);
        const ids = gardens.map((g) => g.id);
        await prisma.garden.updateMany({
            where: { id: { in: ids } },
            data: {
                summary: "",
            },
        });
        processed += gardens.length;
        console.log(`✔ Wiped ${processed} garden summaries so far…`);
    }
    console.log(`🎉 Done! Total plaintext garden summaries removed: ${processed}.`);
}
removePlaintextGardenSummaries()
    .catch((err) => {
    console.error("💥 ERROR during garden summary removal:", err);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
