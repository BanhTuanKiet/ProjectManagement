using Microsoft.AspNetCore.Authorization;

public class RoleRequirement : IAuthorizationRequirement
{
    public string[] AllowedRoles { get; }
    public string[] AllowedMethods { get; }

    public RoleRequirement(string[] allowedRoles, string[] allowedMethods)
    {
        AllowedRoles = allowedRoles;
        AllowedMethods = allowedMethods;
    }
}
