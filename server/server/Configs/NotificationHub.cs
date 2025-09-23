using Microsoft.AspNetCore.SignalR;

namespace server.Configs
{
    public class NotificationHub : Hub
    {
        public async Task NotifyAssignedTask(string userId, Models.Notification notification)
        {
            await Clients.User(userId).SendAsync("TaskAssigned", notification);
        }
    }
}
