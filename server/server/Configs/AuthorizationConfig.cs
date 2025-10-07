using Microsoft.AspNetCore.Authorization;
using server.Configs;
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

        builder.Services.AddSingleton<IAuthorizationHandler, MemberHandler>();
        builder.Services.AddSingleton<IAuthorizationHandler, AssigneeHandler>();
        builder.Services.AddSingleton<IAuthorizationHandler, PMorLeaderHandler>();
        builder.Services.AddSingleton<IAuthorizationHandler, ProjectManagerHandler>();

        return builder;
    }
}
