using System;
using System.Collections.Generic;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace server.Models;

public partial class ProjectManagementContext : IdentityDbContext<ApplicationUser, ApplicationRole, string,
                                                                  ApplicationUserClaim, ApplicationUserRole,
                                                                ApplicationUserLogin, ApplicationRoleClaim, ApplicationUserToken>
{
    public ProjectManagementContext()
    {
    }

    public ProjectManagementContext(DbContextOptions<ProjectManagementContext> options)
        : base(options)
    {
    }
    public DbSet<ApplicationUser> ApplicationUsers { get; set; }
    public virtual DbSet<ActivityLog> ActivityLogs { get; set; }
    public virtual DbSet<Comment> Comments { get; set; }
    public virtual DbSet<File> Files { get; set; }
    public virtual DbSet<Folder> Folders { get; set; }
    public virtual DbSet<FolderSnapshot> FolderSnapshots { get; set; }
    public virtual DbSet<Notification> Notifications { get; set; }
    public virtual DbSet<Project> Projects { get; set; }
    public virtual DbSet<ProjectFileSnapshot> ProjectFileSnapshots { get; set; }
    public virtual DbSet<ProjectHistory> ProjectHistories { get; set; }
    public virtual DbSet<ProjectMember> ProjectMembers { get; set; }
    public virtual DbSet<Sprint> Sprints { get; set; }
    public virtual DbSet<SubTask> SubTasks { get; set; }
    public virtual DbSet<Tag> Tags { get; set; }
    public virtual DbSet<Task> Tasks { get; set; }
    public virtual DbSet<Backlog> Backlogs { get; set; }
    public virtual DbSet<TaskHistory> TaskHistories { get; set; }
    public virtual DbSet<ProjectInvitations> ProjectInvitations { get; set; }
    public virtual DbSet<Plans> Plans { get; set; }
    public virtual DbSet<Features> Features { get; set; }
    public virtual DbSet<PlanFeatures> PlanFeatures { get; set; }
    public virtual DbSet<Payments> Payments { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            modelBuilder.Entity<ApplicationUser>().ToTable("AspNetUsers");

            entity.HasKey(e => e.Id).HasName("PK_AspNetUsers");
        });

        modelBuilder.Entity<ApplicationRole>(entity =>
        {
            modelBuilder.Entity<ApplicationRole>().ToTable("AspNetRoles");

            entity.HasKey(e => e.Id).HasName("PK_AspNetRoles");
        });

        modelBuilder.Entity<ApplicationUserRole>(entity =>
        {
            modelBuilder.Entity<ApplicationUserRole>().ToTable("AspNetUserRoles");

            //entity.HasKey(e => e.UserId).HasName("PK_AspNetUserRoles");
            entity.HasKey(r => new { r.UserId, r.RoleId });
        });

        modelBuilder.Entity<ApplicationUserLogin>(entity =>
        {
            entity.HasKey(l => new { l.LoginProvider, l.ProviderKey });
        });

        // ApplicationUserToken: composite key
        modelBuilder.Entity<ApplicationUserToken>(entity =>
        {
            entity.HasKey(t => new { t.UserId, t.LoginProvider, t.Name });
        });

        // ApplicationRoleClaim
        modelBuilder.Entity<ApplicationRoleClaim>(entity =>
        {
            entity.HasKey(rc => rc.Id);
        });

        // ApplicationUserClaim
        modelBuilder.Entity<ApplicationUserClaim>(entity =>
        {
            entity.HasKey(uc => uc.Id);
        });
        modelBuilder.Entity<ActivityLog>(entity =>
        {
            entity.HasKey(e => e.LogId).HasName("PK__Activity__5E54864844AAB951");

            entity.ToTable("ActivityLog");

            entity.Property(e => e.Action).HasMaxLength(255);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.TargetId).HasMaxLength(100);
            entity.Property(e => e.TargetType).HasMaxLength(50);
            entity.Property(e => e.UserId).HasMaxLength(128);

            entity.HasOne(d => d.Project).WithMany(p => p.ActivityLogs)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ActivityLog_Project");

            entity.HasOne(d => d.User).WithMany(p => p.ActivityLogs)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ActivityLog_User");
        });

        modelBuilder.Entity<Comment>(entity =>
        {
            entity.HasKey(e => e.CommentId).HasName("PK__Comments__C3B4DFCAB03B4A37");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UserId).HasMaxLength(128);

            entity.HasOne(d => d.Task).WithMany(p => p.Comments)
                .HasForeignKey(d => d.TaskId)
                .HasConstraintName("FK_Comments_Task");

            entity.HasOne(d => d.User).WithMany(p => p.Comments)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comments_User");
        });

        modelBuilder.Entity<File>(entity =>
        {
            entity.HasKey(e => e.FileId).HasName("PK__Files__6F0F98BFC600FB7F");

            entity.Property(e => e.FileName).HasMaxLength(500);
            entity.Property(e => e.FilePath).HasMaxLength(1000);
            entity.Property(e => e.FileType).HasMaxLength(50);
            entity.Property(e => e.IsLatest).HasDefaultValue(true);
            entity.Property(e => e.UploadedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.UploadedBy).HasMaxLength(128);
            entity.Property(e => e.Version).HasDefaultValue(1);

            entity.HasOne(d => d.Folder).WithMany(p => p.Files)
                .HasForeignKey(d => d.FolderId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Files_Folder");

            entity.HasOne(d => d.Task).WithMany(p => p.Files)
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Files_Task");

            entity.HasOne(d => d.UploadedByNavigation).WithMany(p => p.Files)
                .HasForeignKey(d => d.UploadedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Files_UploadedBy");
        });

        modelBuilder.Entity<Folder>(entity =>
        {
            entity.HasKey(e => e.FolderId).HasName("PK__Folders__ACD7107F37788C12");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.Name).HasMaxLength(300);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Folders)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Folders_CreatedBy");

            entity.HasOne(d => d.ParentFolder).WithMany(p => p.InverseParentFolder)
                .HasForeignKey(d => d.ParentFolderId)
                .HasConstraintName("FK_Folders_ParentFolder");

            entity.HasOne(d => d.Project).WithMany(p => p.Folders)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Folders_Project");
        });

        modelBuilder.Entity<FolderSnapshot>(entity =>
        {
            entity.HasKey(e => e.SnapshotId).HasName("PK__FolderSn__664F572BA6297C34");

            entity.ToTable("FolderSnapshot");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.SnapshotName).HasMaxLength(300);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.FolderSnapshots)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_FolderSnapshot_CreatedBy");

            entity.HasOne(d => d.Folder).WithMany(p => p.FolderSnapshots)
                .HasForeignKey(d => d.FolderId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_FolderSnapshot_Folder");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E1297746A75");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Link).HasMaxLength(1000);
            entity.Property(e => e.Message).HasMaxLength(1000);
            entity.Property(e => e.UserId).HasMaxLength(128);
            entity.Property(e => e.CreatedId).HasMaxLength(128);
            entity.Property(e => e.Type).HasMaxLength(20);

            entity.HasOne(d => d.Project).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Notifications_Project");

            entity.HasOne(d => d.User).WithMany(p => p.Notifications)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Notifications_User");

            entity.HasOne(d => d.CreatedBy).WithMany(p => p.CreatedNotifications)
                .HasForeignKey(d => d.CreatedId)
                .OnDelete(DeleteBehavior.ClientSetNull);
            // .HasConstraintName("FK_Notification_AspNetUsers_CreatedId");
        });

        modelBuilder.Entity<Payments>(entity =>
        {
            entity.ToTable("Payments");

            entity.HasKey(p => p.Id);

            entity.Property(p => p.Id)
                  .HasDefaultValueSql("NEWID()");

            entity.Property(p => p.UserId)
                  .HasMaxLength(128)
                  .IsRequired();

            entity.Property(p => p.Amount)
                  .HasColumnType("decimal(18,2)")
                  .IsRequired();

            entity.Property(p => p.Currency)
                  .HasMaxLength(3)
                  .HasDefaultValue("VND")
                  .IsRequired();

            entity.Property(p => p.Gateway)
                  .HasMaxLength(20)
                  .HasDefaultValue("VNPay")
                  .IsRequired();

            entity.Property(p => p.Status)
                  .HasMaxLength(20)
                  .HasDefaultValue("Pending")
                  .IsRequired();

            entity.Property(p => p.CreatedAt)
                  .HasDefaultValueSql("GETUTCDATE()");

            // entity.HasOne<ApplicationUser>()
            //       .WithMany()
            //       .HasForeignKey(p => p.UserId)
            //       .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Project>(entity =>
        {
            entity.HasKey(e => e.ProjectId).HasName("PK__Projects__761ABEF02F26C1DE");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.Name).HasMaxLength(300);
            entity.Property(e => e.IsStarred)
                .HasColumnType("bit")
                .HasDefaultValue(false);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.Projects)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Projects_CreatedBy");
        });

        modelBuilder.Entity<ProjectFileSnapshot>(entity =>
        {
            entity.HasKey(e => e.SnapshotId).HasName("PK__ProjectF__664F572BB4634AB6");

            entity.ToTable("ProjectFileSnapshot");

            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.SnapshotName).HasMaxLength(300);

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.ProjectFileSnapshots)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProjectFileSnapshot_CreatedBy");

            entity.HasOne(d => d.Project).WithMany(p => p.ProjectFileSnapshots)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ProjectFileSnapshot_Project");
        });

        modelBuilder.Entity<ProjectHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__ProjectH__4D7B4ABD1F574CA6");

            entity.ToTable("ProjectHistory");

            entity.Property(e => e.ChangedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.ChangedBy).HasMaxLength(128);
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.Name).HasMaxLength(300);

            entity.Ignore(e => e.ChangedByNavigation);
            entity.Ignore(e => e.Project);
        });

        modelBuilder.Entity<ProjectMember>(entity =>
        {
            entity.HasKey(e => new { e.ProjectId, e.UserId }).HasName("PK__ProjectM__A76232348CAD0E4E");

            entity.Property(e => e.UserId).HasMaxLength(128);
            entity.Property(e => e.JoinedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.RoleInProject).HasMaxLength(50);

            entity.HasOne(d => d.Project).WithMany(p => p.ProjectMembers)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("FK_ProjectMembers_Project");

            entity.HasOne(d => d.User).WithMany(p => p.ProjectMembers)
                .HasForeignKey(d => d.UserId)
                .HasConstraintName("FK_ProjectMembers_User");
        });

        modelBuilder.Entity<Sprint>(entity =>
        {
            entity.HasKey(e => e.SprintId).HasName("PK__Sprints__29F16AC04B07645B");

            entity.Property(e => e.Name).HasMaxLength(200);

            entity.HasOne(d => d.Project).WithMany(p => p.Sprints)
                .HasForeignKey(d => d.ProjectId)
                .HasConstraintName("FK_Sprints_Project");
        });

        modelBuilder.Entity<SubTask>(entity =>
        {
            entity.HasKey(e => e.SubTaskId).HasName("PK__SubTasks__869FF1824E07358A");

            entity.Property(e => e.AssigneeId).HasMaxLength(128);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.Status)
                .HasMaxLength(50)
                .HasDefaultValue("To Do");
            entity.Property(e => e.Title).HasMaxLength(255);

            entity.HasOne(d => d.Assignee).WithMany(p => p.SubTasks)
                .HasForeignKey(d => d.AssigneeId)
                .HasConstraintName("FK_SubTasks_Assignee");

            entity.HasOne(d => d.Task).WithMany(p => p.SubTasks)
                .HasForeignKey(d => d.TaskId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_SubTasks_Task");
        });

        modelBuilder.Entity<Tag>(entity =>
        {
            entity.HasKey(e => e.TagId).HasName("PK__Tags__657CF9ACCC7D27D4");

            entity.Property(e => e.TagColor).HasMaxLength(20);
            entity.Property(e => e.TagName).HasMaxLength(100);

            entity.HasOne(d => d.Project).WithMany(p => p.Tags)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tags_Project");
        });

        modelBuilder.Entity<Backlog>(entity =>
        {
            entity.HasKey(e => e.BacklogId).HasName("PK_Backlogs");

            entity.Property(e => e.Name).HasMaxLength(300);
            entity.Property(e => e.Description).HasMaxLength(1000);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");

            entity.HasOne(e => e.Project)
                .WithMany(p => p.Backlogs)
                .HasForeignKey(e => e.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Backlogs_Project");
        });

        modelBuilder.Entity<Task>(entity =>
        {
            entity.HasKey(e => e.TaskId).HasName("PK__Tasks__7C6949B13B1F1EE9");

            entity.Property(e => e.AssigneeId).HasMaxLength(128);
            entity.Property(e => e.CreatedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.EstimateHours).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.Priority).HasDefaultValue((byte)2);
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(300);

            entity.HasOne(d => d.Assignee).WithMany(p => p.TaskAssignees)
                .HasForeignKey(d => d.AssigneeId)
                .HasConstraintName("FK_Tasks_Assignee");

            entity.HasOne(d => d.CreatedByNavigation).WithMany(p => p.TaskCreatedByNavigations)
                .HasForeignKey(d => d.CreatedBy)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tasks_CreatedBy");

            entity.HasOne(d => d.Project).WithMany(p => p.Tasks)
                .HasForeignKey(d => d.ProjectId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Tasks_Project");

            entity.HasMany(d => d.Tags).WithMany(p => p.Tasks)
                .UsingEntity<Dictionary<string, object>>(
                    "TaskTag",
                    r => r.HasOne<Tag>().WithMany()
                        .HasForeignKey("TagId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_TaskTags_Tag"),
                    l => l.HasOne<Task>().WithMany()
                        .HasForeignKey("TaskId")
                        .OnDelete(DeleteBehavior.ClientSetNull)
                        .HasConstraintName("FK_TaskTags_Task"),
                    j =>
                    {
                        j.HasKey("TaskId", "TagId").HasName("PK__TaskTags__AA3E862BCB448FAB");
                        j.ToTable("TaskTags");
                    });
            entity.HasOne(d => d.Sprint)
                .WithMany(p => p.Tasks)
                .HasForeignKey(d => d.SprintId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Tasks_Sprint");

            entity.HasOne(d => d.Backlog)
                .WithMany(p => p.Tasks)
                .HasForeignKey(d => d.BacklogId)
                .OnDelete(DeleteBehavior.SetNull)
                .HasConstraintName("FK_Tasks_Backlog");
        });

        modelBuilder.Entity<TaskHistory>(entity =>
        {
            entity.HasKey(e => e.HistoryId).HasName("PK__TaskHist__4D7B4ABDECBA943C");

            entity.ToTable("TaskHistory");

            entity.Property(e => e.AssigneeId).HasMaxLength(128);
            entity.Property(e => e.ChangedAt).HasDefaultValueSql("(sysutcdatetime())");
            entity.Property(e => e.ChangedBy).HasMaxLength(128);
            entity.Property(e => e.CreatedBy).HasMaxLength(128);
            entity.Property(e => e.EstimateHours).HasColumnType("decimal(6, 2)");
            entity.Property(e => e.Status).HasMaxLength(50);
            entity.Property(e => e.Title).HasMaxLength(300);

            // ✅ thêm cấu hình cho IsDeleted
            entity.Property(e => e.IsDeleted)
                .HasDefaultValue(false)
                .IsRequired();

            // Giữ các ID nhưng không tạo ràng buộc FK
            entity.Ignore(e => e.Assignee);
            entity.Ignore(e => e.ChangedByNavigation);
            entity.Ignore(e => e.CreatedByNavigation);
            entity.Ignore(e => e.Task);
        });

        modelBuilder.Entity<ProjectInvitations>(entity =>
        {
            entity.ToTable("ProjectInvitations");

            entity.HasKey(e => e.Id)
                  .HasName("PK__ProjectI__3214EC078A400FA2");

            entity.Property(e => e.Id)
                  .UseIdentityColumn(); // Tự tăng (IDENTITY)

            entity.Property(e => e.ProjectId)
                  .IsRequired();

            entity.Property(e => e.Email)
                  .HasMaxLength(255)
                  .IsRequired();

            entity.Property(e => e.RoleInProject)
                  .HasMaxLength(50)
                  .IsRequired();

            entity.Property(e => e.InvitedAt)
                  .HasDefaultValueSql("GETDATE()");

            entity.Property(e => e.Token)
                  .IsRequired();

            entity.Property(e => e.IsAccepted)
                  .HasDefaultValue(false);

            // Nếu sau này bạn muốn thêm quan hệ với bảng Project
            // entity.HasOne<Project>()
            //       .WithMany()
            //       .HasForeignKey(e => e.ProjectId)
            //       .OnDelete(DeleteBehavior.Cascade);
        });

        // ===== Plans =====
        modelBuilder.Entity<Plans>(entity =>
        {
            entity.ToTable("Plans");

            entity.HasKey(e => e.PlanId);

            entity.Property(e => e.Name)
                  .IsRequired()
                  .HasMaxLength(100);

            entity.Property(e => e.Price)
                  .HasColumnType("decimal(10,2)");

            entity.Property(e => e.Description)
                  .HasMaxLength(255);

            entity.Property(e => e.Badge)
                  .HasDefaultValue(false);
        });

        // ===== Features =====
        modelBuilder.Entity<Features>(entity =>
        {
            entity.ToTable("Features");

            entity.HasKey(e => e.FeatureId);

            entity.Property(e => e.Name)
                  .IsRequired()
                  .HasMaxLength(100);
        });

        // ===== PlanFeatures =====
        modelBuilder.Entity<PlanFeatures>(entity =>
        {
            entity.ToTable("PlanFeatures");

            entity.HasKey(e => e.PlanFeatureId);

            entity.Property(e => e.ValueType)
                  .HasMaxLength(50);

            entity.Property(e => e.Value)
                  .HasMaxLength(255);

            // Thiết lập quan hệ
            entity.HasOne(e => e.Plans)
                  .WithMany(p => p.PlanFeatures)
                  .HasForeignKey(e => e.PlanId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Features)
                  .WithMany(f => f.PlanFeatures)
                  .HasForeignKey(e => e.FeatureId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        OnModelCreatingPartial(modelBuilder);

        modelBuilder.Entity<Task>()
            .ToTable(tb => tb.HasTrigger("trg_TaskHistory_Snapshot"));

        modelBuilder.Entity<Project>()
            .ToTable(tb => tb.HasTrigger("trg_ProjectHistory_Snapshot"));
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}