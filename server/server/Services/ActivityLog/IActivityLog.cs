namespace server.Services.ActivityLog
{
    public interface IActivityLog
    {
        Task<List<Models.ActivityLog>> GetLogsByProjectAsync(int projectId);
        Task<Models.ActivityLog?> AddActivityLog(int projectId, string userId, string action, string targetType, string targetId, string description);
    }
}