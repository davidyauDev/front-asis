export const useRrhhNotificationsPanel = () => {
  const isOpen = useState<boolean>('rrhh-notifications-panel-open', () => false)

  const openNotifications = () => {
    isOpen.value = true
  }

  const closeNotifications = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    openNotifications,
    closeNotifications,
  }
}
