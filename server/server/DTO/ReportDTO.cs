namespace server.DTO
{
    public class ReportDTO
    {
        public class SendReportForm
        {
            public IFormFile File { get; set; } = null!;
            public int ProjectId { get; set; }
        }
    }
}