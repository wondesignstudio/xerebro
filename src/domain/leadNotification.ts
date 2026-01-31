export type LeadNotificationType = 'initial_search'
export type LeadNotificationStatus = 'pending' | 'sent'

export type LeadNotification = {
  id: string
  userId: string
  type: LeadNotificationType
  status: LeadNotificationStatus
  createdAt: string
}
