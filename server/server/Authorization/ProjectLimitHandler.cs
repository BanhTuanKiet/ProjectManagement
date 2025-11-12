using Microsoft.AspNetCore.Authorization;
using server.Configs;
using server.Models;
using System.Threading.Tasks;

public class ProjectLimitHandler : AuthorizationHandler<ProjectLimitRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUsers _userServices;
    private readonly IProjects _projectServices;
    private readonly IPlans _planServices;
    private readonly ISubscriptions _subscriptionServices;
    private readonly IFeature _featureServices;

    public ProjectLimitHandler(
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

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, ProjectLimitRequirement requirement)
    {
        var httpContext = _httpContextAccessor.HttpContext;
        var projectMember = httpContext?.Items["ProjectMember"] as ProjectMember;

        string ownerId = projectMember.Project.CreatedBy;

        ApplicationUser owner = await _userServices.FindUserById(ownerId)
            ?? throw new ErrorException(404, "Owner project not found");

        Subscriptions subscriptions = await _subscriptionServices.FindSubcriptionByUserId(ownerId)
            ?? throw new ErrorException(404, "Subscription not found");

        Features feature = await _featureServices.FindFeatureByName("Number of projects")
            ?? throw new ErrorException(404, "Feature not found");

        PlanFeatures planFeatures = await _planServices.FindPlanFeature(subscriptions.PlanId, feature.FeatureId)
            ?? throw new ErrorException(404, "Plan feature not found");

        int maxProjects = 0;
        if (!int.TryParse(planFeatures.Value, out maxProjects))
        {
            throw new ErrorException(500, "Invalid max project value in plan features");
        }

        int countProject = await _projectServices.CountProject(ownerId);

        if (countProject >= maxProjects)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "You have reached the maximum number of projects allowed by your plan";
            context.Fail();
        }

        context.Succeed(requirement);
    }
}
