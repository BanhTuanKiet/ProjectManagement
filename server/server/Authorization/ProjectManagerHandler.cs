using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using server.Models;

public class ProjectManagerHandler : AuthorizationHandler<OnlyPMRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public ProjectManagerHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, OnlyPMRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        var method = httpContext?.Request?.Method;

        if (projectMember != null && requirement.AllowedRoles.Contains(projectMember?.RoleInProject) && requirement.AllowedMethods.Contains(method))
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        httpContext!.Items["AuthorizeErrorMessage"] = "Only project manager to this projet can perform this operation";
        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
