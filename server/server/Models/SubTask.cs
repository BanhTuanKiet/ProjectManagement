using System;
using System.Collections.Generic;

namespace server.Models;

public partial class SubTask
{
    public int SubTaskId { get; set; }

    public int TaskId { get; set; }

    public string Title { get; set; } = null!;

    public string? Status { get; set; }

    public string? AssigneeId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;  

    public virtual ApplicationUser? Assignee { get; set; }

    public virtual Task Task { get; set; } = null!;
}
