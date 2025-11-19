using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;
using server.Models;
using server.Services.User;
using server.Services.Project;
using server.Services.Task;
using server.Services.SubTask;
using server.Services.Comment;
using server.Services.Sprint;
using server.Services.Backlog;
using server.Services.ActivityLog;
using server.Services;
using server.Services.File;
using server.Services.ProjectMemberService;

namespace server.Configs
{
    public static class DatabaseConfig
    {
        public static void AddDatabaseAndServices(this IServiceCollection services, string connectionString)
        {
            services.AddDbContext<ProjectManagementContext>(options =>
                options.UseSqlServer(connectionString, sqlOptions =>
                    sqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(10),
                        errorNumbersToAdd: null
                    )
                )
            );

            services.AddIdentity<ApplicationUser, ApplicationRole>()
                .AddEntityFrameworkStores<ProjectManagementContext>()
                .AddDefaultTokenProviders();

            services.AddScoped<IUsers, UserServices>();
            services.AddScoped<IProjects, ProjectServices>();
            services.AddScoped<ITasks, TaskServices>();
            services.AddScoped<INotifications, NotificationServices>();
            services.AddScoped<ISubTasks, SubTaskServices>();
            services.AddScoped<IComment, CommentServices>();
            services.AddScoped<ISprints, SprintServices>();
            services.AddScoped<IBacklogs, BacklogServices>();
            services.AddScoped<IFiles, FileServices>();
            services.AddScoped<IPlans, PlanServices>();
            services.AddScoped<IPayments, PaymentServices>();
            services.AddScoped<ISubscriptions, SubscriptionServices>();
            services.AddScoped<IFeature, FeatureServices>();
            services.AddScoped<IActivityLog, ActivityLogServices>();
            services.AddScoped<IProjectMember, ProjectMemberServices>();
        }
    }
}
