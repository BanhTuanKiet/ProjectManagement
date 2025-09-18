using server.DTO;

namespace server.Services.Task
{
    public interface ITasks
    {
        Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(int projectId, int month, int year, FilterDTO.FilterCalendarView filterCalendarView);
        Task<List<TaskDTO.BasicTask>> GetBasicTasksById(int projectId);
        Task<List<TaskDTO.BasicTask>> GetAllBasicTasks();
        // Task<List<TaskDTO.BasicTask>> UpdateBasicTasksById(List<TaskDTO.BasicTask> updatedTasks, int projectId);
        Task<TaskDTO.BasicTask?> PatchTaskField(int projectId, int taskId, Dictionary<string, object> updates);
    }
}
