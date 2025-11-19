using System.ComponentModel.DataAnnotations;

public class UserDTO
{
    public class UserProfile
    {
        public string UserName { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string JobTitle { get; set; }
        public string Department { get; set; }
        public string Organization { get; set; }
        public string Location { get; set; }
        public string Facebook { get; set; }
        public string Instagram { get; set; }
        public string AvatarUrl { get; set; }
        public string ImageCoverUrl { get; set; }
    }

    public class InvitePeopleForm
    {
        public List<People> People { get; set; }
    }

    public class People
    {
        [Required(ErrorMessage = "Email not be empty")]
        [RegularExpression(@"^[^@\s]+@[^@\s]+\.[^@\s]+$", ErrorMessage = "Email is invalid")]
        public string Email { get; set; }
        public string Role { get; set; }
    }
}