using System;
using System.Collections.Generic;

namespace server.Models;

public partial class ProjectMember
{
    public int ProjectId { get; set; }

    public string UserId { get; set; } = null!;

    public string RoleInProject { get; set; } = null!;

    public DateTime JoinedAt { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual ApplicationUser User { get; set; } = null!;
}
