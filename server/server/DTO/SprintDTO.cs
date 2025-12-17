using System.ComponentModel.DataAnnotations;
namespace server.DTO
{
    public class SprintDTO
    {
        public class Create : IValidatableObject
        {
            [Required(ErrorMessage = "Project ID is required.")]
            [Range(1, int.MaxValue, ErrorMessage = "Project ID must be a valid positive number.")]
            public int ProjectId { get; set; }
            [Required(ErrorMessage = "Sprint name is required.")]
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Sprint name must be between 3 and 100 characters.")]
            public string Name { get; set; } = null!;
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }

            public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
            {
                // Lấy ngày hiện tại (chỉ lấy phần ngày, bỏ phần giờ phút)
                var today = DateOnly.FromDateTime(DateTime.Now);

                // 1. Kiểm tra: StartDate không được nằm trong quá khứ
                if (StartDate.HasValue && StartDate.Value < today)
                {
                    yield return new ValidationResult(
                        "Start date cannot be in the past.",
                        new[] { nameof(StartDate) }
                    );
                }

                // 2. Kiểm tra: EndDate không được nằm trong quá khứ
                if (EndDate.HasValue && EndDate.Value < today)
                {
                    yield return new ValidationResult(
                        "End date cannot be in the past.",
                        new[] { nameof(EndDate) }
                    );
                }

                // 3. Kiểm tra Logic: EndDate không được nhỏ hơn StartDate
                if (StartDate.HasValue && EndDate.HasValue)
                {
                    if (EndDate.Value < StartDate.Value)
                    {
                        yield return new ValidationResult(
                            "The end date cannot be earlier than the start date.",
                            new[] { nameof(EndDate) }
                        );
                    }
                }
            }
        }

        public class Update : IValidatableObject
        {
            [StringLength(100, MinimumLength = 3, ErrorMessage = "Sprint name must be between 3 and 100 characters.")]
            public string? Name { get; set; }
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }

            public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
            {
                // Lấy ngày hiện tại (chỉ lấy phần ngày, bỏ phần giờ phút)
                var today = DateOnly.FromDateTime(DateTime.Now);

                // 1. Kiểm tra: StartDate không được nằm trong quá khứ
                if (StartDate.HasValue && StartDate.Value < today)
                {
                    yield return new ValidationResult(
                        "Start date cannot be in the past.",
                        new[] { nameof(StartDate) }
                    );
                }

                // 2. Kiểm tra: EndDate không được nằm trong quá khứ
                if (EndDate.HasValue && EndDate.Value < today)
                {
                    yield return new ValidationResult(
                        "End date cannot be in the past.",
                        new[] { nameof(EndDate) }
                    );
                }

                // 3. Kiểm tra Logic: EndDate không được nhỏ hơn StartDate
                if (StartDate.HasValue && EndDate.HasValue)
                {
                    if (EndDate.Value < StartDate.Value)
                    {
                        yield return new ValidationResult(
                            "The end date cannot be earlier than the start date.",
                            new[] { nameof(EndDate) }
                        );
                    }
                }
            }
        }

        public class BasicSprint
        {
            public int SprintId { get; set; }
            public int ProjectId { get; set; }
            public string Name { get; set; } = null!;
            public DateOnly? StartDate { get; set; }
            public DateOnly? EndDate { get; set; }
        }
    }
}