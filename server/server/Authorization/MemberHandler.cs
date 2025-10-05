using Microsoft.AspNetCore.Authorization;
using server.Models;

public class MemberHandler : AuthorizationHandler<RoleRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MemberHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, RoleRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        Console.WriteLine("Projectmemberrrrrrrrrrrrrrrrrrrr: " + projectMember);
        if (projectMember != null)
        {
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        // context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
