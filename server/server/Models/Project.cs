using System;
using System.Collections.Generic;

namespace server.Models;

public partial class Project
{
    public int ProjectId { get; set; }
    public string Name { get; set; } = null!;
    public string? Description { get; set; }
    public DateOnly? StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public string CreatedBy { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public bool IsArchived { get; set; }
    public bool IsStarred { get; set; }
    public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
    public virtual ApplicationUser CreatedByNavigation { get; set; } = null!;
    public virtual ICollection<Folder> Folders { get; set; } = new List<Folder>();
    public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
    public virtual ICollection<ProjectFileSnapshot> ProjectFileSnapshots { get; set; } = new List<ProjectFileSnapshot>();
    public virtual ICollection<ProjectHistory> ProjectHistories { get; set; } = new List<ProjectHistory>();
    public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
    public virtual ICollection<Sprint> Sprints { get; set; } = new List<Sprint>();
    // public virtual ICollection<Backlog> Backlogs { get; set; } = new List<Backlog>();
    public virtual ICollection<Tag> Tags { get; set; } = new List<Tag>();
    public virtual ICollection<Task> Tasks { get; set; } = new List<Task>();
    public virtual ICollection<Teams> Teams { get; set; } = new List<Teams>();
}
