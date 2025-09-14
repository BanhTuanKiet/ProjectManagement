namespace server.DTO
{
    public class FilterDTO
    {
        public class FilterCalendarView
        {
            public string? search { get; set; }
            public string? assignee { get; set; }
            public string? status { get; set; }
            public string? priority { get; set; }
        }
    }
}
