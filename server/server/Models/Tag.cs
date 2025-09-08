using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Tag
{
    public int TagId { get; set; }

    public int ProjectId { get; set; }

    public string TagName { get; set; } = null!;

    public string? TagColor { get; set; }

    public virtual Project Project { get; set; } = null!;

    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
}
