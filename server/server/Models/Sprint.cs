using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Sprint
{
    public int SprintId { get; set; }

    public int ProjectId { get; set; }

    public string Name { get; set; } = null!;

    public DateOnly? StartDate { get; set; }

    public DateOnly? EndDate { get; set; }

    public virtual Project Project { get; set; } = null!;
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();

}
