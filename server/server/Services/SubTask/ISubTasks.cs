using server.DTO;
using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services.SubTask
{
    public interface ISubTasks
    {
        Task<Models.SubTask> CreateSubTaskAsync(Models.SubTask subTask);
        Task<List<SubTaskDTO.BasicSubTask>> GetAllSubTasks();
        Task<List<SubTaskDTO.BasicSubTask>> GetSubTasksByTaskIdAsync(int taskId);
        Task<Models.SubTask> UpdateSubTaskAsync(SubTaskDTO.UpdateSubTask dto);

    }
}
