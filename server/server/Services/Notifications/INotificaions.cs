using server.DTO;

namespace server.Models
{
    public interface INotifications
    {
        Task<List<Notification>> GetNotificationsByUserId(string userId);
        Task<Notification> SaveNotification(Notification notification);
    }
}
