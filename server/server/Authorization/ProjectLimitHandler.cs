using Microsoft.AspNetCore.Authorization;
using server.Models;

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

        if (projectMember == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Project member not found in context";
            context.Fail();
            return;
        }

        string ownerId = projectMember.Project?.CreatedBy;
        if (string.IsNullOrEmpty(ownerId))
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Owner project not found";
            context.Fail();
            return;
        }

        ApplicationUser owner = await _userServices.FindUserById(ownerId);
        if (owner == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Owner project not found in database";
            context.Fail();
            return;
        }

        Subscriptions subscriptions = await _subscriptionServices.FindSubcriptionByUserId(ownerId);
        if (subscriptions == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Subscription not found";
            context.Fail();
            return;
        }

        Features feature = await _featureServices.FindFeatureByName("Number of projects");
        if (feature == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Feature not found";
            context.Fail();
            return;
        }

        PlanFeatures planFeatures = await _planServices.FindPlanFeature(subscriptions.PlanId, feature.FeatureId);
        if (planFeatures == null)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Plan feature not found";
            context.Fail();
            return;
        }

        if (!int.TryParse(planFeatures.Value, out int maxProjects))
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "Invalid max project value in plan features";
            context.Fail();
            return;
        }

        int countProject = await _projectServices.CountProject(ownerId);
        if (countProject >= maxProjects)
        {
            httpContext!.Items["AuthorizeErrorMessage"] = "You have reached the maximum number of projects allowed by your plan";
            context.Fail();
            return;
        }

        context.Succeed(requirement);
    }
}