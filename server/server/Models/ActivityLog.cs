using System;
using System.Collections.Generic;

namespace server.Models;

public partial class ActivityLog
{
    public long LogId { get; set; }

    public int ProjectId { get; set; }

    public string UserId { get; set; } = null!;

    public string Action { get; set; } = null!;

    public string TargetType { get; set; } = null!;

    public string TargetId { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual ApplicationUser User { get; set; } = null!;
}
