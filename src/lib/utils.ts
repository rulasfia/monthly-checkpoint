import path from "node:path";
import { environment } from "@raycast/api";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

export const execFileAsync = promisify(execFile);

const DB_NAME = "monthly-checkpoint.db";
export const CONST = {
  DB_NAME,
  DB_PATH: path.join(environment.supportPath, DB_NAME),
};

export function getTwoDigitMonth(date: Date): string {
  return (date.getMonth() + 1).toString().padStart(2, "0");
}

export function getTaskMonthlyKey(date: Date) {
  return `${date.getFullYear()}-${getTwoDigitMonth(date)}`;
}

export function getFullMonthFromKey(key: string) {
  const [year, month] = key.split("-");
  switch (month) {
    case "01":
      return `January ${year}`;
    case "02":
      return `February ${year}`;
    case "03":
      return `March ${year}`;
    case "04":
      return `April ${year}`;
    case "05":
      return `May ${year}`;
    case "06":
      return `June ${year}`;
    case "07":
      return `July ${year}`;
    case "08":
      return `August ${year}`;
    case "09":
      return `September ${year}`;
    case "10":
      return `October ${year}`;
    case "11":
      return `November ${year}`;
    case "12":
      return `December ${year}`;
    default:
      return "Unknown";
  }
}

export function formatDueDate(date: number, key: string) {
  const twoDigitDate = date.toString().padStart(2, "0");
  return new Date(`${key}-${twoDigitDate}`);
}

export function formatRenderedDate(date: Date): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  return date.toLocaleDateString(undefined, options);
}

export function isPastDueDate(dueDate: Date): boolean {
  return dueDate < new Date();
}
