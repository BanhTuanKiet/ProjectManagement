using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using server.Models;

public class TesterHandler : AuthorizationHandler<OnlyTesterRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public TesterHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, OnlyTesterRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        var method = httpContext?.Request?.Method;

        if (projectMember != null && requirement.AllowedRoles.Contains(projectMember?.RoleInProject) && requirement.AllowedMethods.Contains(method))
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        httpContext!.Items["AuthorizeErrorMessage"] = "Only tester to this projet can perform this operation";
        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
