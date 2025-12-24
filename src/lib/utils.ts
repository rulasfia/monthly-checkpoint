export function getTwoDigitMonth(date: Date): string {
  return (date.getMonth() + 1).toString().padStart(2, "0");
}

export function getTaskMonthlyKey(date: Date) {
  return `${date.getFullYear()}-${getTwoDigitMonth(date)}`;
}
