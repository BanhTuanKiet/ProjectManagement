using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;

public class RequireAssigneeMiddleware
{
    private readonly RequestDelegate _next;

    public RequireAssigneeMiddleware(RequestDelegate next)
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
            var task = context.Items["Task"] as server.Models.Task;

            if (task == null || task.AssigneeId != userId)
            {
                context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
                await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "Only members assigned this task can perform this operation" }));
                return;
            }
        }

        await _next(context);
    }
}