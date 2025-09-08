using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Notification
{
    public long NotificationId { get; set; }

    public string UserId { get; set; } = null!;

    public int? ProjectId { get; set; }

    public string Message { get; set; } = null!;

    public string? Link { get; set; }

    public bool IsRead { get; set; }

    public DateTime CreatedAt { get; set; }

    public virtual Project? Project { get; set; }

    public virtual ApplicationUser User { get; set; } = null!;
}
