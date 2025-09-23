using Microsoft.AspNetCore.Builder;

namespace server.Configs
{
    public static class MiddlewareConfig
    {
        public static void MiddlewareCustom(this IApplicationBuilder app)
        {
            app.UseMiddleware<ErrorHandlingMiddleware>();

            app.UseWhen(ctx =>
                ctx.Request.Path.StartsWithSegments("/tasks") ||
                ctx.Request.Path.StartsWithSegments("/comments") ||
                ctx.Request.Path.StartsWithSegments("/files") ||
                ctx.Request.Path.StartsWithSegments("/folders"),
                branch =>
                {
                    branch.UseMiddleware<RequireMemberMiddleware>();
                }
            );

            app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/tasks"), branch =>
            {
                branch.UseMiddleware<RequireLeaderOrPmMiddleware>();
            });
        }
    }
}
