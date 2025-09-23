using server.DTO;

namespace server.Models
{
    public interface INotifications
    {
        Task<Notification> SaveNotification(Notification notification);
    }
}
