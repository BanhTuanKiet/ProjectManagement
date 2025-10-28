﻿using Microsoft.EntityFrameworkCore.Metadata.Internal;
using server.DTO;

namespace server.Services.Task
{
    public interface ITasks
    {
        Task<Models.Task> GetTaskById(int taskId);

        Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(int projectId, int? month, int? year, FilterDTO.FilterCalendarView? filterCalendarView);

        Task<List<TaskDTO.BasicTask>> GetBasicTasksById(int projectId);

        Task<List<TaskDTO.BasicTask>> GetAllBasicTasks();
        // Task<List<TaskDTO.BasicTask>> UpdateBasicTasksById(List<TaskDTO.BasicTask> updatedTasks, int projectId);
        Task<TaskDTO.BasicTask?> PatchTaskField(int projectId, int taskId, Dictionary<string, object> updates);

        Task<Models.Task> AddNewTask(Models.Task newTask);

        Task<int> BulkDeleteTasksAsync(int projectId, List<int> ids);

        Task<Models.Task> UpdateTaskStatus(int taskId, string newStatus);

        Task<Models.Task> UpdateTaskDescription(int taskId, string description);

        Task<Models.Task> UpdateTaskStartDate(int taskId, DateTime? startDate);

        Task<Models.Task> UpdateTaskDueDate(int taskId, DateTime? dueDate);
        Task<List<TaskDTO.BasicTask>> GetTasksBySprintOrBacklog(int projectId, int? sprintId, int? backlogId);

        Task<Models.Task> RestoreTaskFromHistory(int taskId);

        Task<IEnumerable<object>> GetAllDeletedTasksAsync(int projectId);
        Task<IEnumerable<object>> FilterDeletedTasks(int projectId, Dictionary<string, string> filters, string? keyword);

        Task<List<TaskDTO.BasicTask>> FilterTasks(int projectId, Dictionary<string, string> filters, string? keyword);

        Task<List<TaskDTO.BasicTask>> SearchTasks(int projectId, string keyword);
    }
}