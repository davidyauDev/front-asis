import { CalendarDate, getLocalTimeZone } from "@internationalized/date";
export function formatToYMD(
  input: string | number | Date = new Date(),
  lastDay = false
): string {
  const date = lastDay ? getLastDayOfMonth(input) : new Date(input);

  // Si la fecha es inválida
  if (isNaN(date.getTime())) {
    throw new Error("Fecha inválida: " + input);
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function getLastDayOfMonth(
  input: string | number | Date = new Date()
): Date {
  const date = new Date(input);

  if (isNaN(date.getTime())) {
    throw new Error("Fecha inválida: " + input);
  }

  const year = date.getFullYear();
  const month = date.getMonth(); // 0 = Enero

  // Día 0 del siguiente mes = último día del mes actual
  return new Date(year, month + 1, 0);
}

export function toCalendarDate(date: Date) {
  return new CalendarDate(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate()
  );
}

export function fromCalToDate(calendar: CalendarDate) {
  return calendar.toDate(getLocalTimeZone())
}
