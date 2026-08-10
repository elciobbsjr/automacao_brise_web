export function encodeWeekDays(
  values: number[],
): number {
  return values.reduce(
    (total, value) => total + value,
    0,
  );
}

export function decodeWeekDays(
  repetitionValue: number,
): number[] {
  const days = [
    1,
    2,
    4,
    8,
    16,
    32,
    64,
  ];

  return days.filter(
    (day) =>
      (repetitionValue & day) === day,
  );
}

export function createUnixTimestamp(
  date: string,
  time: string,
  timeZone: number,
): number {
  const [year, month, day] = date
    .split("-")
    .map(Number);

  const [hour, minute] = time
    .split(":")
    .map(Number);

  const utcMilliseconds = Date.UTC(
    year,
    month - 1,
    day,
    hour - timeZone,
    minute,
    0,
  );

  return Math.floor(
    utcMilliseconds / 1000,
  );
}