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

public class SubscriptionRequirement : IAuthorizationRequirement
{
    public string PolicyName { get; }

    public SubscriptionRequirement(string policyName)
    {
        PolicyName = policyName;
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
        : base(new string[] { }, new[] { "POST", "PUT", "DELETE", "PATCH" }) { }
}

public class OnlyPMOrLeaderRequirement : RoleRequirement
{
    public OnlyPMOrLeaderRequirement()
        : base(new[] { "Project Manager", "Leader" }, new[] { "POST", "PUT", "PATCH", "DELETE" }) { }
}

public class OnlyPMRequirement : RoleRequirement
{
    public OnlyPMRequirement()
        : base(new[] { "Project Manager", }, new[] { "POST", "PUT", "PATCH", "DELETE" }) { }
}

public class OnlyTesterRequirement : RoleRequirement
{
    public OnlyTesterRequirement()
        : base(new[] { "Tester", }, new[] { "POST", "PUT", "PATCH", "DELETE", "PATCH" }) { }
}

public class ProjectLimitRequirement : SubscriptionRequirement
{
    public ProjectLimitRequirement() : base("Project Limit") { }
}

public class MemberLimitRequirement : SubscriptionRequirement
{
    public MemberLimitRequirement() : base("Member Limit") { }
}

public class FileStorageLimitRequirement : SubscriptionRequirement
{
    public FileStorageLimitRequirement() : base("File Storage Limit") { }
}
