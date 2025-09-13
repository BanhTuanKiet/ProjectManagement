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

        public async Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(
            int projectId,
            int month,
            int year,
            FilterDTO.FilterCalendarView filters)
        {
            var query = _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.CreatedByNavigation)
                .Where(t => t.ProjectId == projectId
                            && t.CreatedAt.Month == month
                            && t.CreatedAt.Year == year);

            if (!string.IsNullOrEmpty(filters.status))
                query = query.Where(t => t.Status == filters.status);

            if (!string.IsNullOrEmpty(filters.assignee))
                query = query.Where(t => t.Assignee.UserName == filters.assignee);

            //if (!string.IsNullOrEmpty(filters.Priority))
            //    query = query.Where(t => t.Priority.ToString() == filters.Priority);

            if (!string.IsNullOrEmpty(filters.search))
            {
                query = query.Where(t => t.Title.Contains(filters.search) || t.Description.Contains(filters.search));
            }

            var tasks = await query.ToListAsync();
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
