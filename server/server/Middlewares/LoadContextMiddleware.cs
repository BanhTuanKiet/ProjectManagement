// Middleware load context chung
using System.Net;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;

public class LoadContextMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<LoadContextMiddleware> _logger;

    public LoadContextMiddleware(RequestDelegate next, ILogger<LoadContextMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, ProjectManagementContext dbContext)
    {
        try
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var routeValues = context.Request.RouteValues;
            int? projectId = routeValues.TryGetValue("projectId", out var pid) && int.TryParse(pid?.ToString(), out var p) ? p : null;
            int? taskId = routeValues.TryGetValue("taskId", out var tid) && int.TryParse(tid?.ToString(), out var t) ? t : null;

            if (projectId != null)
            {
                var projectMember = await dbContext.ProjectMembers
                    .Include(m => m.Project)
                    .FirstOrDefaultAsync(m => m.ProjectId == projectId && m.UserId == userId);

                context.Items["ProjectId"] = projectId;
                context.Items["ProjectMember"] = projectMember;
            }

            if (taskId != null)
            {
                var task = await dbContext.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
                context.Items["TaskId"] = taskId;
                context.Items["Task"] = task;
            }
        }
        catch (ErrorException ex)
        {
            _logger.LogError(ex, "Error in LoadContextMiddleware");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await context.Response.WriteAsJsonAsync(new { ErrorMessage = "Internal Server Error" });
            return;
        }

        await _next(context);
    }
}
