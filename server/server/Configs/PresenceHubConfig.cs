using System.Collections.Concurrent;
using Microsoft.AspNetCore.SignalR;
using server.Models;
using Microsoft.EntityFrameworkCore;

namespace server.Configs
{
    public class OnlineUser
    {
        public string UserId { get; set; } = default!;
        public string ConnectionId { get; set; } = default!;
        public List<int> Projects { get; set; } = new();
    }

    public class PresenceHubConfig : Hub
    {
        private readonly ProjectManagementContext _context;

        public PresenceHubConfig(ProjectManagementContext context)
        {
            _context = context;
        }
        private static ConcurrentDictionary<string, OnlineUser> OnlineUsers = new();

        public static IEnumerable<string> GetUserOnline(int projectId, string createdId)
        {
            return OnlineUsers.Values
                .Where(u => u.Projects.Contains(projectId) && u.UserId != createdId)
                .Select(u => u.UserId);
        }

        public override async System.Threading.Tasks.Task OnConnectedAsync()
        {
            var userId = Context.UserIdentifier ?? Context.ConnectionId;

            var projects = await _context.ProjectMembers
                .Where(pm => pm.UserId == userId)
                .Select(pm => pm.ProjectId)
                .ToListAsync();

            var onlineUser = new OnlineUser
            {
                UserId = userId,
                ConnectionId = Context.ConnectionId,
                Projects = projects
            };

            OnlineUsers[userId] = onlineUser;

            await Clients.Others.SendAsync("UserOnline", onlineUser);
            await Clients.Caller.SendAsync("OnlineUsers", OnlineUsers.Values);

            await base.OnConnectedAsync();
        }

        public override async System.Threading.Tasks.Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier ?? Context.ConnectionId;

            if (OnlineUsers.TryRemove(userId, out var removedUser))
            {
                await Clients.All.SendAsync("UserOffline", removedUser.UserId);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public static async System.Threading.Tasks.Task Signout(IHubContext<PresenceHubConfig> hubContext, string userId)
        {
            if (OnlineUsers.TryRemove(userId, out var removedUser))
            {
                await hubContext.Clients.All.SendAsync("UserOffline", removedUser.UserId);
            }
        }
    }
}
