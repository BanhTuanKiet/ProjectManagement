using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace server.Configs
{
    public class ActiveUser
    {
        public string UserId { get; set; } = null!;
        public string Name { get; set; } = null!;
        public int TaskId { get; set; }
        public string? AvatarUrl { get; set; }
    }

    public class TaskHubConfig : Hub
    {
        private static ConcurrentDictionary<string, ActiveUser> ActiveUsers = new();

        public async Task JoinTaskGroup(int taskId)
        {
            var userId = Context.UserIdentifier ?? Context.ConnectionId;
            var name = Context.User?.FindFirst(ClaimTypes.Name)?.Value ?? "Unknow";
            var avatarUrl = Context.User?.FindFirstValue("avatar_url") ?? "";

            var user = new ActiveUser
            {
                UserId = userId,
                Name = name,
                TaskId = taskId,
                AvatarUrl = avatarUrl
            };

            ActiveUsers[userId] = user;

            await Groups.AddToGroupAsync(Context.ConnectionId, $"task-{taskId}");
            await Clients.OthersInGroup($"task-{taskId}")
                .SendAsync("UserJoinedTask", user);

            var usersInTask = ActiveUsers
                .Where(x => x.Value.TaskId == taskId)
                .Select(x => x.Value);

            await Clients.Caller.SendAsync("ActiveUsersInTask", usersInTask);
        }

        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            var userId = Context.UserIdentifier ?? Context.ConnectionId;

            if (ActiveUsers.TryRemove(userId, out ActiveUser? user))
            {
                await Clients.OthersInGroup($"task-{user.TaskId}")
                    .SendAsync("UserLeftTask", user);
            }

            await base.OnDisconnectedAsync(exception);
        }

        public async Task GetActiveUsers(int taskId)
        {
            var usersInTask = ActiveUsers
                .Where(x => x.Value.TaskId == taskId)
                .Select(x => x.Value);

            await Clients.Caller.SendAsync("ActiveUsersInTask", usersInTask);
        }

        public async static Task TaskUpdated(IHubContext<TaskHubConfig> hubContext, DTO.TaskDTO.BasicTask basicTask, int projectId, string userId)
        {
            // var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            // await hubContext.Clients.Users(recipients).SendAsync("TaskUpdated", basicTask);
            await hubContext.Clients.All.SendAsync("TaskUpdated", basicTask);
        }

        public async static Task AddedTask(IHubContext<TaskHubConfig> hubContext, int projectId, string userId, DTO.TaskDTO.BasicTask basicTask)
        {
            var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            await hubContext.Clients.All.SendAsync("AddedTask", basicTask);
        }
        public static async Task DeletedTasks(IHubContext<TaskHubConfig> hubContext, int projectId, string userId, List<int> taskIds)
        {
            var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            await hubContext.Clients.Users(recipients).SendAsync("TasksDeleted", taskIds);
        }
    }
}
