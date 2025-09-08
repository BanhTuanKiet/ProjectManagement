using System;
using System.Collections.Generic;

namespace server.Models;

public partial class FolderSnapshot
{
    public long SnapshotId { get; set; }

    public int FolderId { get; set; }

    public string SnapshotName { get; set; } = null!;

    public string CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ApplicationUser CreatedByNavigation { get; set; } = null!;

    public virtual Folder Folder { get; set; } = null!;
}
