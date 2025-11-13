using Microsoft.AspNetCore.Authorization;
using server.Configs;
public static class AuthRoleConfig
{
    public static AuthorizationBuilder AddRolePolicies(this AuthorizationBuilder builder)
    {
        builder.AddPolicy("MemberRequirement", policy =>
            policy.Requirements.Add(new OnlyMemberRequirement()));

        builder.AddPolicy("AssigneeRequirement", policy =>
            policy.Requirements.Add(new OnlyAssigneeRequirement()));

        builder.AddPolicy("PMOrLeaderRequirement", policy =>
            policy.Requirements.Add(new OnlyPMOrLeaderRequirement()));

        builder.AddPolicy("PMRequirement", policy =>
            policy.Requirements.Add(new OnlyPMRequirement()));

        builder.AddPolicy("ProjectLimitRequirement", policy =>
            policy.Requirements.Add(new ProjectLimitRequirement()));

        builder.AddPolicy("MemberLimitRequirement", policy =>
            policy.Requirements.Add(new MemberLimitRequirement()));

        builder.AddPolicy("FileStorageLimitRequirement", policy =>
            policy.Requirements.Add(new FileStorageLimitRequirement()));

        builder.Services.AddScoped<IAuthorizationHandler, MemberHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, AssigneeHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, PMorLeaderHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, ProjectManagerHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, ProjectLimitHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, MemberLimitHandler>();
        builder.Services.AddScoped<IAuthorizationHandler, FileStorageLimitHandler>();

        return builder;
    }
}
