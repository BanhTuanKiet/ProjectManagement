using Microsoft.AspNetCore.Authorization;
using Microsoft.Extensions.Options;

public static class AuthorizationConfig
{
    public static void AuthorizationPolicy(this IServiceCollection services)
    {
        services.AddAuthorization(options =>
        {
            options.AddPolicy("MemberRequirement", policy =>
                policy.Requirements.Add(new RoleRequirement(
                    new string[] { },
                    new string[] { }
                )));

            options.AddPolicy("AssigneeRequirement", policy =>
                policy.Requirements.Add(new RoleRequirement(
                    new string[] { },
                    new[] { "POST", "PUT", "DELETE" }
                )));

            options.AddPolicy("PMOrLeaderRequirement", policy =>
                policy.Requirements.Add(new RoleRequirement(
                    new string[] { "ProjectManager", "Leader" },
                    new[] { "POST", "PUT", "DELETE" }
                )));

            services.AddSingleton<IAuthorizationHandler, MemberHandler>();
            services.AddSingleton<IAuthorizationHandler, AssigneeHandler>();
        });
    }
}