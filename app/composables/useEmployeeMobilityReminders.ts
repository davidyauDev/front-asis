import { useLocalStorage } from '@vueuse/core'

export type EmployeeMobilityReminder = {
  title: string
  content: string
  updatedAt: string
}

type ReminderStore = Record<string, EmployeeMobilityReminder>

const STORAGE_KEY = 'employee_mobility_monthly_reminders_v1'

const keyOf = (employeeId: number, year: number, month: number) => `${employeeId}:${year}:${month}`

export const useEmployeeMobilityReminders = () => {
  const store = useLocalStorage<ReminderStore>(STORAGE_KEY, {})

  const get = (employeeId: number, year: number, month: number) => {
    return store.value[keyOf(employeeId, year, month)] ?? null
  }

  const upsert = (
    employeeId: number,
    year: number,
    month: number,
    reminder: Omit<EmployeeMobilityReminder, 'updatedAt'>
  ) => {
    store.value = {
      ...store.value,
      [keyOf(employeeId, year, month)]: {
        ...reminder,
        updatedAt: new Date().toISOString(),
      },
    }
  }

  const remove = (employeeId: number, year: number, month: number) => {
    const k = keyOf(employeeId, year, month)
    if (!(k in store.value)) return
    const { [k]: _removed, ...rest } = store.value
    store.value = rest
  }

  const countEmployeeYear = (employeeId: number, year: number) => {
    const prefix = `${employeeId}:${year}:`
    let count = 0
    for (const [k, v] of Object.entries(store.value)) {
      if (!k.startsWith(prefix)) continue
      if ((v?.title ?? '').trim() || (v?.content ?? '').trim()) count++
    }
    return count
  }

  return {
    store,
    get,
    upsert,
    remove,
    countEmployeeYear,
  }
}

