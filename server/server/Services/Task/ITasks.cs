using server.DTO;

namespace server.Services.Task
{
    public interface ITasks
    {
        Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(int projectId, int month, int year, FilterDTO.FilterCalendarView filterCalendarView);
        Task<List<TaskDTO.BasicTask>> GetAllBasicTasks();
    }
}
