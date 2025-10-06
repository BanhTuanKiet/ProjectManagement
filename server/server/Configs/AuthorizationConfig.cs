using Microsoft.AspNetCore.Authorization;

public static class AuthorizationConfig
{
    public static AuthorizationBuilder AddCustomPolicies(this AuthorizationBuilder builder)
    {
        builder.AddPolicy("MemberRequirement", policy =>
            policy.Requirements.Add(new OnlyMemberRequirement()));

        builder.AddPolicy("AssigneeRequirement", policy =>
            policy.Requirements.Add(new OnlyAssigneeRequirement()));

        builder.AddPolicy("PMOrLeaderRequirement", policy =>
            policy.Requirements.Add(new OnlyPMOrLeaderRequirement()));

        builder.AddPolicy("PMRequirement", policy =>
            policy.Requirements.Add(new OnlyPMRequirement()));

        return builder;
    }
}
