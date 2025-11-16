// apps/api/src/types/luxon.d.ts
declare module "luxon" {
  // minimal surface you actually use; you can keep this simple
  export class DateTime {
    static now(): DateTime;
    static fromJSDate(date: Date): DateTime;
    setZone(zone: string): DateTime;
    get isValid(): boolean;
    get hour(): number;
    minus(opts: { days?: number }): DateTime;
    toISODate(): string | null;
  }
}

