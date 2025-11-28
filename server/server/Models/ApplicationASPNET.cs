using System.Threading.Tasks;
using System.Xml.Linq;
using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations.Schema;


namespace server.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string? RefreshToken { get; set; }
        public string? JobTitle { get; set; }
        public string? Department { get; set; }
        public string? Organization { get; set; }
        public string? Location { get; set; }
        public string? AvatarUrl { get; set; }
        public string? ImageCoverUrl { get; set; }
        //Subcription
        public virtual Subscriptions Subscription { get; set; }
        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
        //ActivityLog
        public virtual ICollection<ActivityLog> ActivityLogs { get; set; } = new List<ActivityLog>();
        //Comment
        public virtual ICollection<Comment> Comments { get; set; } = new List<Comment>();
        //File
        public virtual ICollection<File> Files { get; set; } = new List<File>();
        //Folder
        public virtual ICollection<Folder> Folders { get; set; } = new List<Folder>();
        //FolderSnapshot
        public virtual ICollection<FolderSnapshot> FolderSnapshots { get; set; } = new List<FolderSnapshot>();
        //Notification
        public virtual ICollection<Notification> Notifications { get; set; } = new List<Notification>();
        public virtual ICollection<Notification> CreatedNotifications { get; set; } = new List<Notification>();
        //Project
        public virtual ICollection<Project> Projects { get; set; } = new List<Project>();
        //ProjectFileSnapshot
        public virtual ICollection<ProjectFileSnapshot> ProjectFileSnapshots { get; set; } = new List<ProjectFileSnapshot>();
        //ProjectHistory
        [NotMapped]
        public virtual ICollection<ProjectHistory> ProjectHistories { get; set; } = new List<ProjectHistory>();
        //ProjectMember
        public virtual ICollection<ProjectMember> ProjectMembers { get; set; } = new List<ProjectMember>();
        //Task
        public virtual ICollection<Task> TaskAssignees { get; set; } = new List<Task>();
        public virtual ICollection<Task> TaskCreatedByNavigations { get; set; } = new List<Task>();
        //SubTask
        public virtual ICollection<SubTask> SubTasks { get; set; } = new List<SubTask>();
        public virtual ICollection<TeamMembers> TeamMembers { get; set; } = new List<TeamMembers>();
        //Contact
        public ICollection<Contact> Contacts { get; set; }
        //TaskHistory
        [NotMapped]
        public virtual ICollection<TaskHistory> TaskHistoryAssignees { get; set; } = new List<TaskHistory>();
        [NotMapped]
        public virtual ICollection<TaskHistory> TaskHistoryCreatedByNavigations { get; set; } = new List<TaskHistory>();
        [NotMapped]
        public virtual ICollection<TaskHistory> TaskHistoryChangedByNavigations { get; set; } = new List<TaskHistory>();
    }

    public class ApplicationRole : IdentityRole
    {
        public virtual ICollection<ApplicationUserRole> UserRoles { get; set; } = new List<ApplicationUserRole>();
    }

    public class ApplicationUserRole : IdentityUserRole<String>
    {
        public virtual ApplicationUser? User { get; set; }
        public virtual ApplicationRole? Role { get; set; }
    }

    public class ApplicationUserClaim : IdentityUserClaim<String>
    {
        public virtual ApplicationUser? User { get; set; }
    }

    public class ApplicationUserLogin : IdentityUserLogin<String>
    {
        public virtual ApplicationUser? User { get; set; }
    }

    public class ApplicationRoleClaim : IdentityRoleClaim<String>
    {
        public virtual ApplicationRole? Role { get; set; }
    }

    public class ApplicationUserToken : IdentityUserToken<String>
    {
        public virtual ApplicationUser? User { get; set; }
    }

}
