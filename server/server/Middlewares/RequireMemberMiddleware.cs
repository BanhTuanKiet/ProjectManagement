using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using server.Models;

public class RequireMemberMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<RequireMemberMiddleware> _logger;

    public RequireMemberMiddleware(RequestDelegate next, ILogger<RequireMemberMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, ProjectManagementContext dbContext)
    {
        try
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var pathSegments = context.Request.Path.Value?.Split("/", StringSplitOptions.RemoveEmptyEntries);
            string? projectIdStr = pathSegments?.FirstOrDefault(s => int.TryParse(s, out _));

            if (!int.TryParse(projectIdStr, out int projectId))
            {
                context.Response.StatusCode = (int)HttpStatusCode.BadRequest;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Bad request: Cannot find projectId in route" }));
                return;
            }

            var projectMember = await dbContext.ProjectMembers
                .FirstOrDefaultAsync(p => p.UserId == userId && p.ProjectId == projectId);

            if (projectMember == null)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Forbidden: User is not a member of this project" }));
                return;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in CheckProjectRoleMiddleware");
            context.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Internal Server Error in CheckProjectRoleMiddleware" }));
            return;
        }

        await _next(context);
    }
}