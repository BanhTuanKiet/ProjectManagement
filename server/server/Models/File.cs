using System;
using System.Collections.Generic;

namespace server.Models;

public partial class File
{
    public long FileId { get; set; }

    public int? FolderId { get; set; }

    public int? TaskId { get; set; }

    public string FileName { get; set; } = null!;

    public string FilePath { get; set; } = null!;

    public string? FileType { get; set; }

    public int Version { get; set; }

    public bool IsLatest { get; set; }

    public string UploadedBy { get; set; } = null!;

    public DateTime UploadedAt { get; set; }

    public virtual Folder? Folder { get; set; }

    public virtual Task? Task { get; set; }

    public virtual ApplicationUser UploadedByNavigation { get; set; } = null!;
}
