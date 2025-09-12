using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Services.Task;

namespace server.Services.Project
{
    public class TasksService : ITasks
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public TasksService(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(int projectId)
        {
            List<server.Models.Task> tasks = await _context.Tasks
                .Include(t => t.Assignee)
                // .Include(t => t.CreatedBy)
                .Where(t => t.ProjectId == projectId)
                .ToListAsync();

            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }
        
        public async Task<List<TaskDTO.BasicTask>> GetAllBasicTasks()
        {
            List<server.Models.Task> tasks = await _context.Tasks
                .Include(t => t.Assignee)
                .ToListAsync();

            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }
    }
}
