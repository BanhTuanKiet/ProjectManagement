using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
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
builder.Services.AddAuthorizationBuilder().AddRolePolicies();
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
});

builder.Services.AddSignalR();
builder.Services.AddHttpClient();
builder.Services.AddControllers(options =>
{
    // options.Filters.Add<ValidateInputFilter>();
    // options.ModelMetadataDetailsProviders.Add(new SystemTextJsonValidationMetadataProvider());
});

builder.Services.Configure<ApiBehaviorOptions>(options =>
{
    options.SuppressModelStateInvalidFilter = true;
});

builder.Services.AddControllers(options =>
{
    options.Filters.Add<ValidateInputFilter>();
});

builder.Services.AddOpenApi();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

// ✅ ĐẶT MIDDLEWARE XỬ LÝ LỖI TRƯỚC UseRouting()
app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseRouting();

app.UseCors("_allowSpecificOrigins");
app.UseAuthentication();
app.UseMiddleware<LoadContextMiddleware>();
app.UseAuthorization();

app.MapControllers();

// SignalR
app.MapHub<PresenceHubConfig>("/hubs/presence");
app.MapHub<NotificationHub>("/hubs/notification");
app.MapHub<TaskHubConfig>("/hubs/task");

app.Run();
// Make the implicit Program class public so test projects can access it