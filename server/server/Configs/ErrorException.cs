namespace server.Configs
{
    public class ErrorException : Exception
    {
        public int StatusCode { get; set; } = 500;
        public string ErrorMessage { get; set; }

        public ErrorException(string message)
        {
            ErrorMessage = message;
        }
        public ErrorException(int statusCode, string message)
        {
            StatusCode = statusCode;
            ErrorMessage = message;
        }
    }
}