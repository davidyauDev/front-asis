import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function formatToDayMonthYear(
  input: string | number | Date = new Date()
): string {
  const date = new Date(input)

  if (isNaN(date.getTime())) {
    throw new Error(`Fecha inválida: ${input}`)
  }

  return format(date, 'dd MMMM yyyy', {
    locale: es,
  })
}