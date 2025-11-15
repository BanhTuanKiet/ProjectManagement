using Microsoft.AspNetCore.Authorization;
using server.DTO;
using server.Models;

public class MemberLimitHandler : AuthorizationHandler<MemberLimitRequirement>
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IUsers _userServices;
    private readonly IProjects _projectServices;
    private readonly IPlans _planServices;
    private readonly ISubscriptions _subscriptionServices;
    private readonly IFeature _featureServices;

    public MemberLimitHandler(
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

    protected override async System.Threading.Tasks.Task HandleRequirementAsync(AuthorizationHandlerContext context, MemberLimitRequirement requirement)
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

        List<ProjectDTO.ProjectMembers> members = await _projectServices.GetProjectMembers(projectId);
        int countMembers = members.Count;
        string ownerId = projectMember?.Project.CreatedBy;

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

        Features feature = await _featureServices.FindFeatureByName("Number of members");
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

        var maxMembers = planFeatures.Value;

        if (maxMembers != "Unlimited" && int.TryParse(maxMembers, out int max) && countMembers >= max)
        {
            httpContext!.Items["AuthorizeErrorMessage"] =
                "You have reached the maximum number of members allowed by your plan";
            context.Fail();
            return;
        }

        context.Succeed(requirement);
    }
}