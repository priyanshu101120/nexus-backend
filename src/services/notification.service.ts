import { notificationRepository } from "../repositories/notificcation.repository";

export const notificationService = {
  async list(userId: string) {
    return notificationRepository.findByUser(userId);
  },

  async markAsRead(id: string, userId: string) {
    await notificationRepository.markAsRead(id, userId);

    return {
      message: "Notification marked as read",
    };
  },

  async markAllAsRead(userId: string) {
    await notificationRepository.markAllAsRead(userId);

    return {
      message: "All notifications marked as read",
    };
  },
};