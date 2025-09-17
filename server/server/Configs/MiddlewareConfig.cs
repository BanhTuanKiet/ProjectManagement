using Microsoft.AspNetCore.Builder;

namespace server.Configs
{
    public static class MiddlewareConfig
    {
        public static void MiddlewareCustom(this IApplicationBuilder app)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>();

            app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/tasks"), branch =>
            {
                branch.UseMiddleware<CheckProjectRoleMiddleware>();
            });
        }
    }
}
