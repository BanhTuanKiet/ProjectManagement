using System.ComponentModel.DataAnnotations;

namespace server.DTO
{
    public class TaskDTO
    {
        public class NewTaskView
        {
            [Required(ErrorMessage = "Title is required")]
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters")]
            public string Title { get; set; } = null!;

            [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
            public string? Description { get; set; }

            // [Required(ErrorMessage = "Assignee is required")]
            public string? AssigneeId { get; set; }

            // [Required(ErrorMessage = "Priority is required")]
            [Range(1, 3, ErrorMessage = "Priority must be between 1 (Low) and 3 (High)")]
            public byte? Priority { get; set; }

            // [Required(ErrorMessage = "Deadline is required")]
            [DataType(DataType.Date, ErrorMessage = "Invalid date format for deadline")]
            public string? Deadline { get; set; }

            // [Required(ErrorMessage = "SprintId is required")]
            [Range(1, int.MaxValue, ErrorMessage = "SprintId must be a valid number")]
            public int? SprintId { get; set; }
            public int? BacklogId { get; set; }
        }

        public class CreateNewTask
        {
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string AssigneeId { get; set; }
            [Range(1, 3, ErrorMessage = "Priority must be between 1 (High) and 3 (Low).")]
            public byte Priority { get; set; }
            public DateTime? Deadline { get; set; }
        }

        public class QuickCreate
        {
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
            public string Title { get; set; } = null!;
            public int? SprintId { get; set; } // null = backlog
        }

        public class BasicTask
        {
            public int TaskId { get; set; }
            public int ProjectId { get; set; }
            public string Title { get; set; } = null!;
            public string? Description { get; set; }
            public string Status { get; set; } = null!;
            public byte Priority { get; set; }
            public string? AssigneeId { get; set; }
            public string? Assignee { get; set; }
            public string CreatedBy { get; set; } = null!;
            public string? CreatedName { get; set; }
            public DateTime CreatedAt { get; set; }
            public DateTime? Deadline { get; set; }
            public decimal? EstimateHours { get; set; }
            public int? SprintId { get; set; }
            public int? BacklogId { get; set; }
            public bool IsActive { get; set; }
            public string? Tag { get; set; }
            public string? AvatarUrl { get; set; }
        }

        public class NewTaskListView
        {
            public string Title { get; set; } = null!;
            public string Status { get; set; } = null!;
            public int? SprintId { get; set; }
            public int? BacklogId { get; set; }
        }

        public class BulkDeleteTasksDto
        {
            public int ProjectId { get; set; }
            public List<int> Ids { get; set; } = new List<int>();
        }

        public class UpdateTask : IValidatableObject
        {
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Title must be between 3 and 100 characters.")]
            public string? Title { get; set; }
            public string? Description { get; set; }
            [Range(1, 3, ErrorMessage = "Priority must be between 1 and 3.")]
            public byte? Priority { get; set; }
            public DateTime? CreatedAt { get; set; }
            public DateTime? Deadline { get; set; }

            public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
            {
                var today = DateOnly.FromDateTime(DateTime.Now);

                if (Deadline.HasValue)
                {
                    // Convert Deadline từ DateTime sang DateOnly để so sánh
                    var deadlineDateOnly = DateOnly.FromDateTime(Deadline.Value);
                    if (deadlineDateOnly < today)
                    {
                        yield return new ValidationResult(
                            "Deadline cannot be in the past.",
                            new[] { nameof(Deadline) }
                        );
                    }
                }
                if (CreatedAt.HasValue && Deadline.HasValue)
                {
                    if (Deadline.Value < CreatedAt.Value)
                    {
                        yield return new ValidationResult(
                            "The deadline cannot be earlier than the start date.",
                            new[] { nameof(Deadline) }
                        );
                    }
                }
            }
        }

        public class SupportRequestModel
        {
            public string Content { get; set; } = string.Empty;
            public string AssigneeId { get; set; } = string.Empty;
            public string Assignee { get; set; } = string.Empty;
        }

        public class TaskPatchResult
        {
            public TaskDTO.BasicTask Task { get; set; } = null!;
            public string ChangeSummary { get; set; } = string.Empty;
        }

    }
}