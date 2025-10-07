using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using server.Models;

public class PMorLeaderHandler : AuthorizationHandler<RoleRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public PMorLeaderHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        var method = httpContext?.Request?.Method;
        var isAllowedRole = requirement.AllowedRoles.Contains(projectMember?.RoleInProject);
        var isAllowedMethod = requirement.AllowedMethods.Contains(method);

        if (method == "GET")
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        if (projectMember != null && isAllowedRole && isAllowedMethod)
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        httpContext!.Items["AuthorizeErrorMessage"] = "You do not have permission for this action";
        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
