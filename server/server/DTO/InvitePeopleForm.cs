using System.ComponentModel.DataAnnotations;

namespace server.DTO
{
    public class InvitePeopleForm
    {
        [Required(ErrorMessage = "Email không được để trống")]
        [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Email không hợp lệ")]
        public string ToEmail { get; set; }
        public int ProjectId { get; set; }
        public string RoleInProject { get; set; }
    }
}