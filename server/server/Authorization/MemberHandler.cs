using Microsoft.AspNetCore.Authorization;
using server.Models;

public class MemberHandler : AuthorizationHandler<OnlyMemberRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public MemberHandler(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    protected override System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, OnlyMemberRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;

        if (projectMember != null)
        {
            Console.WriteLine("He is memberrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr");
            context.Succeed(requirement);
            return System.Threading.Tasks.Task.CompletedTask;
        }

        context.Fail();
        return System.Threading.Tasks.Task.CompletedTask;
    }
}
