public static class MiddlewareConfig
{
    public static void MiddlewareCustom(this IApplicationBuilder app)
    {
        app.UseMiddleware<ErrorHandlingMiddleware>();
        app.UseMiddleware<LoadContextMiddleware>();
        app.UseWhen(ctx => ctx.Request.Path.StartsWithSegments("/tasks"),
            branch => branch.UseMiddleware<RequireLeaderOrPmMiddleware>()
        );
        app.UseMiddleware<CustomAuthorizationMiddleware>();
    }
}
