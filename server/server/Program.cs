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

// Add services to the container.
builder.Services.AddScoped<IUsers, UsersService>();
builder.Services.AddScoped<IProjects, ProjectsService>();
builder.Services.AddScoped<ITasks, TasksService>();

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();


app.UseCors("_allowSpecificOrigins");
app.UseRouting();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();
