using AutoMapper;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace server.Services.SubTask
{
    public class SubTaskService : ISubTasks
    {
        private readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public SubTaskService(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Models.SubTask> CreateSubTaskAsync(Models.SubTask subTask)
        {
            await _context.SubTasks.AddAsync(subTask);
            await _context.SaveChangesAsync();
            return subTask;
        }

        public async Task<List<SubTaskDTO.BasicSubTask>> GetAllSubTasks()
        {
            var subTasks = await _context.SubTasks.ToListAsync();
            return _mapper.Map<List<SubTaskDTO.BasicSubTask>>(subTasks);
        }

        public async Task<List<SubTaskDTO.BasicSubTask>> GetSubTasksByTaskIdAsync(int taskId)
        {
            var subtasks = await _context.SubTasks
                .Where(st => st.TaskId == taskId)
                .ToListAsync();
            return _mapper.Map<List<SubTaskDTO.BasicSubTask>>(subtasks);
        }
    }
}
