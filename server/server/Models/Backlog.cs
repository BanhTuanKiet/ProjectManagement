using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Backlog
{
    public int BacklogId { get; set; }

    public int ProjectId { get; set; }

    public string Name { get; set; } = null!;

    public string? Description { get; set; }

    public DateOnly? CreatedAt { get; set; }

    public DateOnly? DueDate { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
}
