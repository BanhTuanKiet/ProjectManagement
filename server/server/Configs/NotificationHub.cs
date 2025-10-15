using Microsoft.AspNetCore.SignalR;
using server.Models;

namespace server.Configs
{
    public class NotificationHub : Hub
    {
        public static async System.Threading.Tasks.Task SendTaskAssignedNotification(IHubContext<NotificationHub> hubContext, string userId, Notification notification)
        {
            await hubContext.Clients.User(userId).SendAsync("NotifyTaskAssigned", notification);
        }

        public static async System.Threading.Tasks.Task SendNotificationToAllExcept(
            IHubContext<NotificationHub> hubContext,
            int projectId,
            string userId,
            Notification notification)
        {
            var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            await hubContext.Clients.Users(recipients).SendAsync("NotifyTaskChanged", notification);
        }
    }
}