using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.Build.Framework;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.Models;
using server.Services.Project;
using server.Services.Task;
using server.Services.User;

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
// .AddAppCookie();

// Add services to the container.
builder.Services.AddScoped<IUsers, UsersService>();
builder.Services.AddScoped<IProjects, ProjectsService>();
builder.Services.AddScoped<ITasks, TasksService>();
builder.Services.AddScoped<INotifications, NotificationsService>();
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
app.UseAuthorization();

//middleware
app.MiddlewareCustom();

app.MapControllers();
app.MapHub<PresenceHubConfig>("/hubs/presence");

app.Run();