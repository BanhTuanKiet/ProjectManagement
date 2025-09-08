using System;
using System.Collections.Generic;

namespace server.Models;

public partial class ProjectHistory
{
    public long HistoryId { get; set; }

    public int ProjectId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public string CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public string ChangedBy { get; set; } = null!;

    public DateTime ChangedAt { get; set; }

    public virtual ApplicationUser ChangedByNavigation { get; set; } = null!;

    public virtual Project Project { get; set; } = null!;
}
