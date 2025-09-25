using server.DTO;

namespace server.Models
{
    public interface INotifications
    {
        Task<List<Notification>> GetNotificationsByUserId(string userId);
        Task<Notification> GetNotificationById(long notifyId);
        Task<Notification> SaveNotification(Notification notification);
        Task<int> MarkRead(long notifyId);
    }
}
