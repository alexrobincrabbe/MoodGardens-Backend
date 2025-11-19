declare module "luxon" {

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

