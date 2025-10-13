using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ModelBinding.Metadata;
using Microsoft.EntityFrameworkCore;
using server.Configs;

var builder = WebApplication.CreateBuilder(args);
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.CorsPolicy();
builder.Services.AddAutoMapper(typeof(AutoMapperConfig).Assembly);
builder.Services.AddDatabaseAndServices(connectionString);
builder.Services.AddCloudinary(builder.Configuration);
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

builder.Services.AddSignalR();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateInputFilter>();
    options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});
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
 //app.UseMiddleware<CustomAuthorizationMiddleware>();
// app.MiddlewareCustom();

app.MapControllers();

//signalr
app.MapHub<PresenceHubConfig>("/hubs/presence");
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<TaskHubConfig>("/hubs/task");

app.Run();
// Make the implicit Program class public so test projects can access it