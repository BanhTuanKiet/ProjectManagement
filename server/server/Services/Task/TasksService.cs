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

            if (!string.IsNullOrEmpty(filters.status) && filters.status != "all")
                query = query.Where(t => t.Status == filters.status);

            if (!string.IsNullOrEmpty(filters.assignee) && filters.assignee != "all")
                query = query.Where(t => t.Assignee.UserName == filters.assignee);

            if (!string.IsNullOrEmpty(filters.priority))
                query = query.Where(t => t.Priority == Int32.Parse(filters.priority));

            if (!string.IsNullOrEmpty(filters.search))
            {
                query = query.Where(t => t.Title.Contains(filters.search) || t.Description.Contains(filters.search));
            }

            var tasks = await query.ToListAsync();
            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }
        public async Task<List<TaskDTO.BasicTask>> GetBasicTasksById(int projectId)
        {
            List<server.Models.Task> tasks = await _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.CreatedByNavigation)
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

        // public async Task<List<TaskDTO.BasicTask>> UpdateBasicTasksById(List<TaskDTO.BasicTask> updatedTasks, int projectId)
        // {
        //     var taskIds = updatedTasks.Select(t => t.TaskId).ToList();

        //     // Lấy các task từ DB
        //     var tasks = await _context.Tasks
        //         .Where(t => taskIds.Contains(t.TaskId) && t.ProjectId == projectId)
        //         .ToListAsync();

        //     foreach (var updatedTask in updatedTasks)
        //     {
        //         var existingTask = tasks.FirstOrDefault(t => t.TaskId == updatedTask.TaskId);
        //         if (existingTask != null)
        //         {
        //             // Chỉ update nếu có sự thay đổi
        //             if (existingTask.Title != updatedTask.Title && !string.IsNullOrWhiteSpace(updatedTask.Title))
        //                 existingTask.Title = updatedTask.Title;

        //             if (existingTask.Description != updatedTask.Description)
        //                 existingTask.Description = updatedTask.Description;

        //             if (existingTask.Status != updatedTask.Status && !string.IsNullOrWhiteSpace(updatedTask.Status))
        //                 existingTask.Status = updatedTask.Status;

        //             if (existingTask.Priority != updatedTask.Priority)
        //                 existingTask.Priority = updatedTask.Priority;

        //             if (existingTask.AssigneeId != updatedTask.AssigneeId)
        //                 existingTask.AssigneeId = updatedTask.AssigneeId;

        //             if (existingTask.Deadline != updatedTask.Deadline)
        //                 existingTask.Deadline = updatedTask.Deadline;

        //             if (existingTask.EstimateHours != updatedTask.EstimateHours)
        //                 existingTask.EstimateHours = updatedTask.EstimateHours;
        //         }
        //     }

        //     await _context.SaveChangesAsync();

        //     return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        // }
        public async Task<TaskDTO.BasicTask?> PatchTaskField(int projectId, int taskId, Dictionary<string, object> updates)
        {
            var task = await _context.Tasks
                .FirstOrDefaultAsync(t => t.TaskId == taskId && t.ProjectId == projectId);

            if (task == null) return null;

            foreach (var kvp in updates)
            {
                switch (kvp.Key.ToLower())
                {
                    case "title":
                        task.Title = kvp.Value?.ToString();
                        break;

                    case "description":
                        task.Description = kvp.Value?.ToString();
                        break;

                    case "status":
                        task.Status = kvp.Value?.ToString();
                        break;

                    case "priority":
                        if (byte.TryParse(kvp.Value?.ToString(), out var prio))
                            task.Priority = prio;
                        break;

                    case "assigneeid":
                        task.AssigneeId = kvp.Value?.ToString();
                        break;

                    case "deadline":
                        if (DateTime.TryParse(kvp.Value?.ToString(), out var date))
                            task.Deadline = date;
                        break;

                    case "estimatehours":
                        if (decimal.TryParse(kvp.Value?.ToString(), out var hrs))
                            task.EstimateHours = hrs;
                        break;
                }
            }

            await _context.SaveChangesAsync();
            return _mapper.Map<TaskDTO.BasicTask>(task);
        }
        public async Task<Models.Task> AddNewTask(Models.Task newTask)
        {
            await _context.Tasks.AddAsync(newTask);
            await _context.SaveChangesAsync();
            return newTask;
        }
        public async Task<int> BulkDeleteTasksAsync(int projectId, List<int> ids)
        {
            var tasks = await _context.Tasks
                .Where(t => ids.Contains(t.TaskId) && t.ProjectId == projectId)
                .ToListAsync();

            if (tasks.Count == 0) return 0;

            _context.Tasks.RemoveRange(tasks);
            await _context.SaveChangesAsync();

            return tasks.Count; // trả về số lượng đã xoá
        }

        public async Task<Models.Task> GetTaskById(int taskId)
        {
            return await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
        }

        public async Task<Models.Task?> UpdateTaskStatus(int taskId, string newStatus)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
            if (task == null)
                return null;

            task.Status = newStatus;

            await _context.SaveChangesAsync();

            return task;
        }
    }
}
