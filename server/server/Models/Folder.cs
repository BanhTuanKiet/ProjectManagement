using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Folder
{
    public int FolderId { get; set; }

    public int ProjectId { get; set; }

    public int? ParentFolderId { get; set; }

    public string Name { get; set; } = null!;

    public string CreatedBy { get; set; } = null!;

    public DateTime CreatedAt { get; set; }

    public virtual ApplicationUser CreatedByNavigation { get; set; } = null!;

    public virtual ICollection<File> Files { get; set; } = new List<File>();

    public virtual ICollection<FolderSnapshot> FolderSnapshots { get; set; } = new List<FolderSnapshot>();

    public virtual ICollection<Folder> InverseParentFolder { get; set; } = new List<Folder>();

    public virtual Folder? ParentFolder { get; set; }

    public virtual Project Project { get; set; } = null!;
}
