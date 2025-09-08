using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Comment
{
    public long CommentId { get; set; }

    public int TaskId { get; set; }

    public string UserId { get; set; } = null!;

    public string Content { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public bool IsEdited { get; set; }

    public virtual Task Task { get; set; } = null!;

    public virtual ApplicationUser User { get; set; } = null!;
}
