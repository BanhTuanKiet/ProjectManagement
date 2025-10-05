using Microsoft.AspNetCore.Authorization;

public static class AuthorizationConfig
{
    public static AuthorizationBuilder AddCustomPolicies(this AuthorizationBuilder builder)
    {
        builder.AddPolicy("MemberRequirement", policy =>
            policy.Requirements.Add(new RoleRequirement(
                new string[] { },
                new string[] { }
            )));

        builder.AddPolicy("AssigneeRequirement", policy =>
            policy.Requirements.Add(new RoleRequirement(
                new string[] { },
                new[] { "POST", "PUT", "DELETE" }
            )));

        builder.AddPolicy("PMOrLeaderRequirement", policy =>
            policy.Requirements.Add(new RoleRequirement(
                new string[] { "ProjectManager", "Leader" },
                new[] { "POST", "PUT", "DELETE" }
            )));

        return builder;
    }
}
