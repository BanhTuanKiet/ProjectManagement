using System.Net;
using System.Text.Json;
using server.Configs;


public class ErrorHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ErrorHandlingMiddleware> _logger;

    public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
    {
        _next = next;
        _logger = logger;
    }

    public async Task Invoke(HttpContext context)
    {
        try
        {
            Console.WriteLine("Not Error");
            await _next(context);
        }
        catch (ErrorException exception)
        {
            _logger.LogError(exception, "Custom error occurred.");
            Console.WriteLine(exception.ErrorMessage);
            await HandleExceptionAsync(context, exception);
        }
        catch (Exception otherException)
        {
            _logger.LogError(otherException, "Other exception.");
            Console.WriteLine(otherException.Message);
            await HandleOtherExceptionAsync(context, otherException);
        }
    }

    private static Task HandleExceptionAsync(HttpContext context, ErrorException exception)
    {
        Console.WriteLine("HandleExceptionAsync;");
        var response = context.Response;
        response.ContentType = "application/json";
        string defaultMessageError = "Something went wrong! Please try again!";

        if (exception.StatusCode == 500) {
            exception.ErrorMessage = defaultMessageError;
        }

        response.StatusCode = exception.StatusCode;
        Console.WriteLine(exception.StackTrace);
        var errorResponse = new
        {
            ErrorMessage = exception.ErrorMessage,
            //Detail = exception.StackTrace
        };

        return response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }

    private static Task HandleOtherExceptionAsync(HttpContext context, Exception exception)
    {
        Console.WriteLine("HandleOtherExceptionAsync");
        var response = context.Response;
        response.ContentType = "application/json";
        string defaultMessageError = "Something went wrong! Please try again!";

        response.StatusCode = 500;
        Console.WriteLine(exception.StackTrace);

        var errorResponse = new
        {
            ErrorMessage = defaultMessageError
            //Detail = exception.StackTrace
        };

        return response.WriteAsync(JsonSerializer.Serialize(errorResponse));
    }
}