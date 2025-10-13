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
using server.Services;
using server.Services.File;

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

            services.AddScoped<IUsers, UsersService>();
            services.AddScoped<IProjects, ProjectsService>();
            services.AddScoped<ITasks, TasksService>();
            services.AddScoped<INotifications, NotificationsService>();
            services.AddScoped<ISubTasks, SubTaskService>();
            services.AddScoped<IComment, CommentService>();
            services.AddScoped<ISprints, SprintsService>();
            services.AddScoped<IBacklogs, BacklogsService>();
            services.AddScoped<IFiles, FileService>();
        }
    }
}
