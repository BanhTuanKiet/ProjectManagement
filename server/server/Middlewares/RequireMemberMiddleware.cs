using System.Net;
using System.Security.Claims;
using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;

public class RequireMemberMiddleware
{
    private readonly RequestDelegate _next;

    public RequireMemberMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async System.Threading.Tasks.Task InvokeAsync(HttpContext context, ProjectManagementContext dbContext)
    {
        var userId = context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var projectMember = context.Items["ProjectMember"] as ProjectMember;

        if (projectMember == null)
        {
            Console.WriteLine("Member not found");
            context.Response.StatusCode = (int)HttpStatusCode.Forbidden;
            await context.Response.WriteAsync(JsonSerializer.Serialize(new { ErrorMessage = "User is not a member of this project" }));
            return;
        }

        await _next(context);
    }
}