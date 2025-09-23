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

        public async Task GetUsersOnline()
        {
            await Clients.Caller.SendAsync("OnlineUsers", OnlineUsers.Keys);
        }
    }
}
