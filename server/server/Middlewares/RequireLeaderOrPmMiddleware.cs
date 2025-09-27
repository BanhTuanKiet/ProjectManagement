using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;

public class RequireLeaderOrPmMiddleware
{
    private readonly RequestDelegate _next;

    public RequireLeaderOrPmMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, ProjectManagementContext dbContext)
    {
        if (context.Request.Method == HttpMethods.Put
            || context.Request.Method == HttpMethods.Delete
            || context.Request.Method == HttpMethods.Post)
        {
            var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var projectMember = context.Items["ProjectMember"] as ProjectMember;
                
            if (projectMember == null || projectMember.RoleInProject != "Project Manager" && projectMember.RoleInProject != "Leader")
            {
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "You do not have permission for this action" }));
                return;
            }
        }

        await _next(context);
    }
}