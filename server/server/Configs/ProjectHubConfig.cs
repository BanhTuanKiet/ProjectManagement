using System.Collections.Concurrent;
using System.Security.Claims;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.SignalR;

namespace server.Configs
{
    public class ProjectHubConfig : Hub
    {
        public async static Task ProjectUpdated(IHubContext<ProjectHubConfig> hubContext, DTO.ProjectDTO.ProjectBasic basicProject, int projectId, string userId)
        {
            // var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            // await hubContext.Clients.Users(recipients).SendAsync("ProjectUpdated", basicProject);
            await hubContext.Clients.All.SendAsync("ProjectUpdated", basicProject);
        }

        public static async Task DeletedProject(IHubContext<ProjectHubConfig> hubContext, int projectId, string userId)
        {
            var recipients = PresenceHubConfig.GetUserOnline(projectId, userId);
            await hubContext.Clients.Users(recipients).SendAsync("ProjectDeleted", projectId);
        }
    }
}
