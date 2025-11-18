using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Services.Task;
using server.Services.Sprint;
using server.Services.Backlog;
using System.Text.Json;

namespace server.Services.Project
{
    public class TaskServices : ITasks
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public TaskServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<TaskDTO.BasicTask>> GetTaskByUserId(string userId)
        {
            var tasks = await _context.Tasks
                .Where(t => t.AssigneeId == userId)
                .ToListAsync();

            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }

        public async Task<List<TaskDTO.BasicTask>> GetBasicTasksByMonth(
            int projectId,
            int? month,
            int? year,
            FilterDTO.FilterCalendarView? filters)
        {
            var query = _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.CreatedByNavigation)
                .Where(t => t.ProjectId == projectId);

            if (month.HasValue)
                query = query.Where(t => t.CreatedAt.Month == month);

            if (year.HasValue)
                query = query.Where(t => t.CreatedAt.Year == year);

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
            List<Models.Task> tasks = await _context.Tasks
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
                    case "sprintid":
                        if (int.TryParse(kvp.Value?.ToString(), out var sprintId))
                            task.SprintId = sprintId == -1 ? null : sprintId;
                        else
                            task.SprintId = null;
                        break;

                    case "backlogid":
                        if (int.TryParse(kvp.Value?.ToString(), out var backlogId))
                            task.BacklogId = backlogId;
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

        public async Task<Models.Task?> UpdateTask(int taskId, TaskDTO.UpdateTask updatedData)
        {
            var task = await _context.Tasks.FirstOrDefaultAsync(t => t.TaskId == taskId);
            if (task == null)
                return null;

            task.Title = updatedData.Title ?? task.Title;
            task.Description = updatedData.Description ?? task.Description;
            task.Priority = updatedData.Priority ?? task.Priority;
            task.CreatedAt = updatedData.CreatedAt ?? task.CreatedAt;
            task.Deadline = updatedData.Deadline ?? task.Deadline;

            await _context.SaveChangesAsync();
            return task;
        }

        public async Task<List<TaskDTO.BasicTask>> GetTasksBySprintOrBacklog(int projectId, int? sprintId, int? backlogId)
        {
            var query = _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.CreatedByNavigation)
                .Where(t => t.ProjectId == projectId);

            if (sprintId.HasValue)
                query = query.Where(t => t.SprintId == sprintId);

            if (backlogId.HasValue)
                query = query.Where(t => t.BacklogId == backlogId);

            var tasks = await query.ToListAsync();
            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }

        // public async Task<Models.Task> RestoreTaskFromHistory(int taskId)
        // {
        //     using var conn = _context.Database.GetDbConnection();
        //     await conn.OpenAsync();
        //     using var tran = await conn.BeginTransactionAsync();
        //     using var cmd = conn.CreateCommand();
        //     cmd.Transaction = tran;

        //     try
        //     {
        //         // Tắt trigger
        //         cmd.CommandText = "DISABLE TRIGGER trg_TaskHistory_Snapshot ON Tasks;";
        //         await cmd.ExecuteNonQueryAsync();

        //         // Bật IDENTITY_INSERT
        //         cmd.CommandText = "SET IDENTITY_INSERT Tasks ON;";
        //         await cmd.ExecuteNonQueryAsync();

        //         // Insert dữ liệu từ TaskHistory (có SprintId, BacklogId)
        //         cmd.CommandText = @"
        //     INSERT INTO Tasks 
        //     (TaskId, ProjectId, Title, Description, AssigneeId, SprintId, Priority, Status, Deadline, CreatedBy, BacklogId, CreatedAt)
        //     SELECT 
        //         TaskId, ProjectHistoryId, Title, Description, AssigneeId, SprintId, Priority, Status, Deadline, CreatedBy, BacklogId, CreatedAt
        //     FROM TaskHistory
        //     WHERE TaskId = @taskId;
        // ";
        //         var param = cmd.CreateParameter();
        //         param.ParameterName = "@taskId";
        //         param.Value = taskId;
        //         cmd.Parameters.Add(param);

        //         await cmd.ExecuteNonQueryAsync();

        //         // Tắt IDENTITY_INSERT
        //         cmd.CommandText = "SET IDENTITY_INSERT Tasks OFF;";
        //         cmd.Parameters.Clear();
        //         await cmd.ExecuteNonQueryAsync();

        //         // Bật lại trigger
        //         cmd.CommandText = "ENABLE TRIGGER trg_TaskHistory_Snapshot ON Tasks;";
        //         await cmd.ExecuteNonQueryAsync();

        //         await tran.CommitAsync();

        //         var restoredTask = await _context.Tasks
        //             .AsNoTracking()
        //             .FirstOrDefaultAsync(t => t.TaskId == taskId);

        //         return restoredTask ?? throw new Exception("Restore failed: Task not found.");
        //     }
        //     catch (Exception ex)
        //     {
        //         await tran.RollbackAsync();
        //         throw new Exception($"Restore failed for TaskId {taskId}.", ex);
        //     }
        // }

        public async Task<Models.Task> RestoreTaskFromHistory(int taskId)
        {
            using var conn = _context.Database.GetDbConnection();
            await conn.OpenAsync();
            using var tran = await conn.BeginTransactionAsync();
            using var cmd = conn.CreateCommand();
            cmd.Transaction = tran;

            try
            {
                // 🔸 Tắt trigger để tránh snapshot lại khi restore
                cmd.CommandText = "DISABLE TRIGGER trg_TaskHistory_Snapshot ON Tasks;";
                await cmd.ExecuteNonQueryAsync();

                // 🔸 Cho phép chèn ID thủ công
                cmd.CommandText = "SET IDENTITY_INSERT Tasks ON;";
                await cmd.ExecuteNonQueryAsync();

                // 🔸 Chèn lại task từ history (lấy bản mới nhất)
                cmd.CommandText = @"
            INSERT INTO Tasks 
            (TaskId, ProjectId, Title, Description, AssigneeId, SprintId, Priority, Status, Deadline, CreatedBy, BacklogId, CreatedAt)
            SELECT TOP 1
                TaskId, ProjectHistoryId, Title, Description, AssigneeId, SprintId, Priority, Status, Deadline, CreatedBy, BacklogId, CreatedAt
            FROM TaskHistory
            WHERE TaskId = @taskId
            ORDER BY ChangedAt DESC;";
                var param = cmd.CreateParameter();
                param.ParameterName = "@taskId";
                param.Value = taskId;
                cmd.Parameters.Add(param);
                await cmd.ExecuteNonQueryAsync();

                // 🔸 Tắt IDENTITY_INSERT
                cmd.CommandText = "SET IDENTITY_INSERT Tasks OFF;";
                cmd.Parameters.Clear();
                await cmd.ExecuteNonQueryAsync();

                // 🔸 Bật lại trigger
                cmd.CommandText = "ENABLE TRIGGER trg_TaskHistory_Snapshot ON Tasks;";
                await cmd.ExecuteNonQueryAsync();

                // 🔸 Cập nhật lại lịch sử: gắn IsDeleted = 0
                cmd.CommandText = "UPDATE TaskHistory SET IsDeleted = 0, ChangedAt = SYSDATETIME() WHERE TaskId = @taskId;";
                var param2 = cmd.CreateParameter();
                param2.ParameterName = "@taskId";
                param2.Value = taskId;
                cmd.Parameters.Add(param2);
                await cmd.ExecuteNonQueryAsync();

                await tran.CommitAsync();

                var restoredTask = await _context.Tasks
                    .AsNoTracking()
                    .FirstOrDefaultAsync(t => t.TaskId == taskId);

                return restoredTask ?? throw new Exception("Restore failed: Task not found.");
            }
            catch (Exception ex)
            {
                await tran.RollbackAsync();
                throw new Exception($"Restore failed for TaskId {taskId}.", ex);
            }
        }

        public async Task<IEnumerable<object>> FilterDeletedTasks(int projectId, Dictionary<string, string> filters, string? keyword)
        {
            // 1️⃣ Tạo query cơ bản (dùng join thay cho Include)
            var query = from th in _context.TaskHistories
                        join a in _context.Users on th.AssigneeId equals a.Id into assigneeJoin
                        from a in assigneeJoin.DefaultIfEmpty() // LEFT JOIN
                        join c in _context.Users on th.CreatedBy equals c.Id into creatorJoin
                        from c in creatorJoin.DefaultIfEmpty() // LEFT JOIN
                        where th.IsDeleted && th.ProjectHistoryId == projectId
                        select new
                        {
                            TaskHistory = th,
                            AssigneeName = a != null ? a.UserName : null,
                            CreatorName = c != null ? c.UserName : null
                        };

            // 2️⃣ Tìm kiếm theo keyword
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                string lowerKeyword = keyword.Trim().ToLower();

                query = query.Where(x =>
                    (x.TaskHistory.TaskId.ToString().Contains(lowerKeyword)) ||
                    (x.TaskHistory.Title != null && x.TaskHistory.Title.ToLower().Contains(lowerKeyword)) ||
                    (x.TaskHistory.Description != null && x.TaskHistory.Description.ToLower().Contains(lowerKeyword)) ||
                    (x.AssigneeName != null && x.AssigneeName.ToLower().Contains(lowerKeyword)) ||
                    (x.CreatorName != null && x.CreatorName.ToLower().Contains(lowerKeyword))
                );
            }

            // 3️⃣ Lọc theo filters
            foreach (var filter in filters)
            {
                var key = filter.Key;
                var value = filter.Value?.Trim();

                if (string.IsNullOrEmpty(value))
                    continue;

                switch (key)
                {
                    case "Status":
                        query = query.Where(x => x.TaskHistory.Status == value);
                        break;

                    case "Priority":
                        if (byte.TryParse(value, out var priority))
                            query = query.Where(x => x.TaskHistory.Priority == priority);
                        else
                        {
                            query = value.ToLower() switch
                            {
                                "low" => query.Where(x => x.TaskHistory.Priority == 1),
                                "medium" => query.Where(x => x.TaskHistory.Priority == 2),
                                "high" => query.Where(x => x.TaskHistory.Priority == 3),
                                _ => query
                            };
                        }
                        break;

                    case "AssigneeId":
                        query = query.Where(x => x.TaskHistory.AssigneeId == value);
                        break;

                    case "CreatedBy":
                        query = query.Where(x => x.TaskHistory.CreatedBy == value);
                        break;

                    case "AssigneeName":
                        query = query.Where(x => x.AssigneeName != null && x.AssigneeName.Contains(value));
                        break;

                    case "CreatorName":
                        query = query.Where(x => x.CreatorName != null && x.CreatorName.Contains(value));
                        break;
                }
            }

            // 4️⃣ Trả kết quả
            var deletedTasks = await query
                .OrderByDescending(x => x.TaskHistory.ChangedAt)
                .Select(x => new
                {
                    x.TaskHistory.TaskId,
                    x.TaskHistory.ProjectHistoryId,
                    x.TaskHistory.Title,
                    x.TaskHistory.Description,
                    x.TaskHistory.Status,
                    x.TaskHistory.Priority,
                    x.TaskHistory.AssigneeId,
                    AssigneeName = x.AssigneeName,
                    x.TaskHistory.CreatedBy,
                    CreatorName = x.CreatorName,
                    x.TaskHistory.CreatedAt,
                    x.TaskHistory.Deadline,
                    x.TaskHistory.EstimateHours,
                    x.TaskHistory.ChangedBy,
                    x.TaskHistory.ChangedAt
                })
                .ToListAsync();

            return deletedTasks;
        }

        // 1️⃣: Service method để LẤY TẤT CẢ task đã xóa
        public async Task<IEnumerable<object>> GetAllDeletedTasksAsync(int projectId)
        {
            var query = GetDeletedTasksQuery(projectId);

            var deletedTasks = await query
                .OrderByDescending(th => th.ChangedAt)
                .Select(th => new
                {
                    th.TaskId,
                    th.ProjectHistoryId,
                    th.Title,
                    th.Description,
                    th.Status,
                    th.Priority,
                    th.AssigneeId,
                    AssigneeName = _context.ApplicationUsers
                        .Where(u => u.Id == th.AssigneeId)
                        .Select(u => u.UserName)
                        .FirstOrDefault(),
                    th.CreatedBy,
                    CreatorName = _context.ApplicationUsers
                        .Where(u => u.Id == th.CreatedBy)
                        .Select(u => u.UserName)
                        .FirstOrDefault(),
                    th.CreatedAt,
                    th.Deadline,
                    th.EstimateHours,
                    th.ChangedBy,
                    th.ChangedAt
                })
                .ToListAsync();

            return deletedTasks;
        }

        // 3️⃣: Phương thức PRIVATE để tái sử dụng, lấy câu query gốc
        private IQueryable<TaskHistory> GetDeletedTasksQuery(int projectId)
        {
            return _context.TaskHistories
                .Where(th => th.IsDeleted == true && th.ProjectHistoryId == projectId)
                .AsQueryable();
        }

        public async Task<List<TaskDTO.BasicTask>> FilterTasks(int projectId, Dictionary<string, string> filters, string? keyword)
        {
            // 1️⃣ Bắt đầu truy vấn gốc
            var query = _context.Tasks
                .Include(t => t.Assignee)
                .Include(t => t.CreatedByNavigation)
                .Include(t => t.Sprint)
                .Include(t => t.SubTasks)
                    .ThenInclude(st => st.Assignee)
                .Where(t => t.ProjectId == projectId)
                .AsQueryable();

            // 2️⃣ Nếu có keyword, thêm điều kiện tìm kiếm
            if (!string.IsNullOrWhiteSpace(keyword))
            {
                string lowerKeyword = keyword.Trim().ToLower();

                query = query.Where(t =>
                    (t.Title != null && t.Title.ToLower().Contains(lowerKeyword)) ||
                    (t.Description != null && t.Description.ToLower().Contains(lowerKeyword)) ||
                    (t.Assignee != null && t.Assignee.UserName.ToLower().Contains(lowerKeyword)) ||
                    (t.CreatedByNavigation != null && t.CreatedByNavigation.UserName.ToLower().Contains(lowerKeyword)) ||
                    (t.Sprint != null && t.Sprint.Name.ToLower().Contains(lowerKeyword))
                );
            }

            // 2️⃣ Áp dụng từng điều kiện lọc dựa trên key trong filters
            foreach (var filter in filters)
            {
                var key = filter.Key;
                var value = filter.Value?.Trim();

                if (string.IsNullOrEmpty(value))
                    continue;

                switch (key)
                {
                    case "Status":
                        query = query.Where(t => t.Status == value);
                        break;

                    case "Priority":
                        // Cho phép lọc bằng số hoặc chuỗi “Low”, “Medium”, “High”
                        if (byte.TryParse(value, out var priority))
                            query = query.Where(t => t.Priority == priority);
                        else
                        {
                            query = value.ToLower() switch
                            {
                                "low" => query.Where(t => t.Priority == 1),
                                "medium" => query.Where(t => t.Priority == 2),
                                "high" => query.Where(t => t.Priority == 3),
                                _ => query
                            };
                        }
                        break;

                    case "AssigneeId":
                        query = query.Where(t => t.AssigneeId == value);
                        break;

                    case "CreatedBy":
                        query = query.Where(t => t.CreatedBy == value);
                        break;

                    case "SprintId":
                        if (int.TryParse(value, out var sprintId))
                            query = query.Where(t => t.SprintId == sprintId);
                        break;

                    case "AssigneeName":
                        query = query.Where(t => t.Assignee != null && t.Assignee.UserName.Contains(value));
                        break;

                    case "CreatorName":
                        query = query.Where(t => t.CreatedByNavigation != null && t.CreatedByNavigation.UserName.Contains(value));
                        break;

                    case "SprintName":
                        query = query.Where(t => t.Sprint != null && t.Sprint.Name.Contains(value));
                        break;
                }
            }

            var tasks = await query.ToListAsync();

            return _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
        }

        public async Task<List<TaskDTO.BasicTask>> SearchTasks(int projectId, string keyword)
        {
            var tasks = await _context.Tasks
                .FromSqlRaw("EXEC sp_SearchTasks @ProjectId = {0}, @Keyword = {1}", projectId, keyword)
                .ToListAsync();
            Console.WriteLine("Tasks found BBBBBBBBBBBBBBBBB: " + tasks);
            List<TaskDTO.BasicTask> Taskavailable = _mapper.Map<List<TaskDTO.BasicTask>>(tasks);
            Console.WriteLine("Tasks found AAAAAAAAAAAAAAA: " + Taskavailable);
            return Taskavailable;
        }
    }
}