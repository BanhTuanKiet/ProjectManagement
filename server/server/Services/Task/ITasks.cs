using server.DTO;

namespace server.Services.Task
{
    public interface ITasks
    {
        Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(int projectId);
        Task<List<TaskDTO.BasicTask>> GetAllBasicTasks();
    }
}
