import { useState, useCallback } from "react"

export function useNotification() {
  const [notificationMessage, setNotificationMessage] = useState("")
  const [notificationType, setNotificationType] = useState("success")

  const showNotification = useCallback((message, type = "success") => {
    setNotificationMessage(message)
    setNotificationType(type)
  }, [])

  const clearNotification = useCallback(() => {
    setNotificationMessage("")
    setNotificationType("success")
  }, [])

  return { notificationMessage, notificationType, showNotification, clearNotification }
}
