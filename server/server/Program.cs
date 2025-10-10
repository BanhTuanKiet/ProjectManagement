using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;
using server.Services.SubTask;
using server.Services.Project;
using server.Services.Task;
using server.Services.User;
using server.Services.Comment;
using server.Services;
using Microsoft.AspNetCore.Authorization;
using server.Services.Sprint;
using server.Services.Backlog;
using server.Services.File;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.CorsPolicy();
builder.Services.AddAutoMapper(typeof(AutoMapperConfig).Assembly);

builder.Services.AddDbContext<ProjectManagementContext>(options =>
    options.UseSqlServer(connectionString, sqlOptions =>
        sqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null)
    )
);

builder.Services.AddIdentity<ApplicationUser, ApplicationRole>()
    .AddEntityFrameworkStores<ProjectManagementContext>()
    .AddDefaultTokenProviders();

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddGoogleAuth(builder.Configuration)
.AddJWT(builder.Configuration);

builder.Services.AddHttpContextAccessor();

//Add authorization config
builder.Services.AddAuthorizationBuilder().AddCustomPolicies();

// Add services to the container.
builder.Services.AddScoped<IUsers, UsersService>();
builder.Services.AddScoped<IProjects, ProjectsService>();
builder.Services.AddScoped<ITasks, TasksService>();
builder.Services.AddScoped<INotifications, NotificationsService>();
builder.Services.AddScoped<ISubTasks, SubTaskService>();
builder.Services.AddScoped<IComment, CommentService>();
builder.Services.AddScoped<ISprints, SprintsService>();
builder.Services.AddScoped<IBacklogs, BacklogsService>();
builder.Services.AddScoped<IFiles, FileService>();
builder.Services.AddCloudinary(builder.Configuration);


builder.Services.AddSignalR();

builder.Services.AddControllers();

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseRouting();
app.UseCors("_allowSpecificOrigins");
app.UseAuthentication();
app.UseMiddleware<ErrorHandlingMiddleware>();
app.UseMiddleware<LoadContextMiddleware>();
app.UseAuthorization();
// app.UseMiddleware<CustomAuthorizationMiddleware>();
// app.MiddlewareCustom();

app.MapControllers();

//signalr
app.MapHub<PresenceHubConfig>("/hubs/presence");
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<TaskHubConfig>("/hubs/task");

app.Run();
// Make the implicit Program class public so test projects can access it