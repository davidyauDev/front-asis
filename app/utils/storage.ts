export const storage = {
  set(key: string, value: any) {
    if (typeof value === "string") {
      // Guardar strings SIN JSON.stringify
      localStorage.setItem(key, value)
    } else {
      // Guardar objetos como JSON
      localStorage.setItem(key, JSON.stringify(value))
    }
  },

  get<T>(key: string): T | null {
    const item = localStorage.getItem(key)
    if (!item) return null

    // Si NO es JSON válido (ej: un string simple como el token), lo devolvemos tal cual
    if (!item.startsWith('{') && !item.startsWith('[')) {
      return item as unknown as T
    }

    try {
      return JSON.parse(item) as T
    } catch {
      return item as unknown as T
    }
  },

  remove(key: string) {
    localStorage.removeItem(key)
  }
}
