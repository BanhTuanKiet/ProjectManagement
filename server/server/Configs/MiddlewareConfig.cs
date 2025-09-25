public static class MiddlewareConfig
{
    public static void MiddlewareCustom(this IApplicationBuilder app)
    {
        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<LoadContextMiddleware>(); // load 1 lần

        app.UseWhen(ctx =>
            ctx.Request.Path.StartsWithSegments("/tasks") ||
            ctx.Request.Path.StartsWithSegments("/comments") ||
            ctx.Request.Path.StartsWithSegments("/files") ||
            ctx.Request.Path.StartsWithSegments("/folders") ||
            ctx.Request.Path.StartsWithSegments("/notifications"),
            branch => branch.UseMiddleware<RequireMemberMiddleware>()
        );

        app.UseWhen(ctx =>
            ctx.Request.Path.StartsWithSegments("/comments") ||
            ctx.Request.Path.StartsWithSegments("/files") ||
            ctx.Request.Path.StartsWithSegments("/folders") ||
            ctx.Request.Path.StartsWithSegments("/notifications"),
            branch => branch.UseMiddleware<RequireAssigneeMiddleware>()
        );

        app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/tasks"),
            branch => branch.UseMiddleware<RequireLeaderOrPmMiddleware>()
        );
    }
}
