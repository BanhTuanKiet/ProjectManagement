using server.DTO;

namespace server.Models
{
    public interface INotifications
    {
        Task<List<Notification>> GetNotificationsByUserId(string userId);
        Task<List<NotificationDTO.NotificationBasic>> GetUserNotificationsLast7Days(string userId, int countDay);
        Task<List<NotificationDTO.NotificationBasic>> GetNotificationByType(string user, string type);
        Task<Notification> GetNotificationById(long notifyId);
        Task<Notification> SaveNotification(Notification notification);
        Task<int> MarkRead(long notifyId);
        Task<int> DeleteNotify(long notifyId);
    }
}
