using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using server.Models;

public class PMorLeaderRequirement : AuthorizationHandler<RoleRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PMorLeaderRequirement(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userId = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        var task = httpContext?.Items["Task"] as server.Models.Task;
        var method = httpContext?.Request?.Method;

        if (task == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Task not found in context.";
            context.Fail();
            return System.Threading.Tasks.Task.CompletedTask;
        }

        if (task.AssigneeId == userId && requirement.AllowedRoles.Contains(projectMember?.RoleInProject) && requirement.AllowedMethods.Contains(method))
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        httpContext!.Items["AuthorizeErrorMessage"] = "You do not have permission for this action";
        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
