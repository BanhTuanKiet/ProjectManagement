using Microsoft.AspNetCore.SignalR;
using server.Models;

namespace server.Configs
{
    public class NotificationHub : Hub
    {
        public static async System.Threading.Tasks.Task SendTask(IHubContext<NotificationHub> hubContext, string userId, Notification notification)
        {
            await hubContext.Clients.User(userId).SendAsync("NotifyTaskAssigned", notification);
        }
    }
}