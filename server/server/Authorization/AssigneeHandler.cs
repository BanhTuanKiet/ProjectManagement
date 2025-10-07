using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using server.Models;

public class AssigneeHandler : AuthorizationHandler<OnlyAssigneeRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public AssigneeHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, OnlyAssigneeRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var userId = httpContext?.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        var task = httpContext?.Items["Task"] as server.Models.Task;
        var method = httpContext?.Request?.Method;
        var isAllowedMethod = requirement.AllowedMethods.Contains(method);

        if (method == "GET")
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        if (task == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Task not found in context.";
            context.Fail();
            return System.Threading.Tasks.Task.CompletedTask;
        }

        if (task.AssigneeId == userId && isAllowedMethod)
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        httpContext!.Items["AuthorizeErrorMessage"] = "Only members assigned to this task can perform this operation.";
        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
