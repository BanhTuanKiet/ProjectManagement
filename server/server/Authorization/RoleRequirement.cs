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

public class OnlyMemberRequirement : RoleRequirement
{
    public OnlyMemberRequirement()
        : base(new string[] { }, new string[] { }) { }
}

public class OnlyAssigneeRequirement : RoleRequirement
{
    public OnlyAssigneeRequirement()
        : base(new string[] { }, new[] { "POST", "PUT", "DELETE" }) { }
}

public class OnlyPMOrLeaderRequirement : RoleRequirement
{
    public OnlyPMOrLeaderRequirement()
        : base(new[] { "ProjectManager", "Leader" }, new[] { "POST", "PUT", "DELETE" }) { }
}

public class OnlyPMRequirement : RoleRequirement
{
    public OnlyPMRequirement()
        : base(new[] { "ProjectManager", }, new[] { "POST", "PUT", "DELETE" }) { }
}
