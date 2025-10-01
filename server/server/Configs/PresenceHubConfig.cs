using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;

namespace server.Configs
{
    public class PresenceHubConfig : Hub
    {
        private static ConcurrentDictionary<string, string> OnlineUsers = new();
        public override async Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier ?? Context.ConnectionId;
            Console.WriteLine("Presence hub: " + userId);

            OnlineUsers[userId] = Context.ConnectionId;

            await Clients.Others.SendAsync("UserOnline", userId);
            await Clients.Caller.SendAsync("OnlineUsers", OnlineUsers.Keys);

            await base.OnConnectedAsync();
        }

        // public override async Task OnDisconnectedAsync(Exception? exception)
        // {
        //     var userId = Context.UserIdentifier ?? Context.ConnectionId;
        //     if (OnlineUsers.TryRemove(userId, out var connectionId))
        //     {
        //         await Clients.All.SendAsync("UserOffline", userId);
        //         await base.OnDisconnectedAsync(exception);
        //     }
        // }

        public static async Task Signout(IHubContext<PresenceHubConfig> hubContext, string userId)
        {
            if (OnlineUsers.TryRemove(userId, out var connectionId))
            {
                await hubContext.Clients.All.SendAsync("UserOffline", userId);
            }
        }
    }
}
