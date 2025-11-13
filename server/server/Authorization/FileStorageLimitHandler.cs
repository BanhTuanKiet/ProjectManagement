using Microsoft.AspNetCore.Authorization;
using server.DTO;
using server.Models;

public class FileStorageLimitHandler : AuthorizationHandler<FileStorageLimitRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUsers _userServices;
    private readonly IProjects _projectServices;
    private readonly IPlans _planServices;
    private readonly ISubscriptions _subscriptionServices;
    private readonly IFeature _featureServices;

    public FileStorageLimitHandler(
        IHttpContextAccessor httpContextAccessor,
        IUsers userServices,
        IProjects projectServices,
        IPlans planServices,
        ISubscriptions subscriptionServices,
        IFeature featureServices)
    {
        _httpContextAccessor = httpContextAccessor;
        _userServices = userServices;
        _projectServices = projectServices;
        _planServices = planServices;
        _subscriptionServices = subscriptionServices;
        _featureServices = featureServices;
    }

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, FileStorageLimitRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;

        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;
        int projectId = httpContext?.Items["ProjectId"] is int id ? id : 0;

        if (projectId == 0)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Project ID not found in request context";
            context.Fail();
            return;
        }

        context.Succeed(requirement);
    }
}