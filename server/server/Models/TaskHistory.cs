using System;
using System.Collections.Generic;

namespace server.Models;

public partial class TaskHistory
{
    public long HistoryId { get; set; }

    public int TaskId { get; set; }

    public string Title { get; set; } = null!;

    public string? Description { get; set; }

    public string Status { get; set; } = null!;

    public byte Priority { get; set; }

    public string? AssigneeId { get; set; }

    public string CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  

    public DateTime? Deadline { get; set; }

    public decimal? EstimateHours { get; set; }

    public string ChangedBy { get; set; } = null!;

    public DateTime ChangedAt { get; set; }

    public virtual ApplicationUser? Assignee { get; set; }

    public virtual ApplicationUser ChangedByNavigation { get; set; } = null!;

    public virtual ApplicationUser CreatedByNavigation { get; set; } = null!;

    public virtual Task Task { get; set; } = null!;
}
