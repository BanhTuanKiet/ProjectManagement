using System.ComponentModel.DataAnnotations;
using server.DTO;

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
        public string AvatarUrl { get; set; }
        public string ImageCoverUrl { get; set; }
    }

    public class UserProfile2
    {
        public string Id { get; set; }
        public string Avatar { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Location { get; set; }
        public List<Contact> Contacts { get; set; }
        public List<ProjectDTO.ProjectBasic> Projects { get; set; }
        public Subcription Subcription { get; set; }
    }

    public class Subcription
    {
        public string PlanId { get; set; }
        public string PlanName { get; set; }
        public DateTime StartedAt { get; set; }
        public DateTime ExpiredAt { get; set; } 
    }

    public class Contact
    {
        public string MediaId { get; set; }
        public string Media { get; set; }
        public string Url { get; set; }
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

    public class AvailableMember
    {
        public string MemberId { get; set; }
        public string MemberName { get; set; }
    }

    public class InfoProfile
    {
        public string Name { get; set; }
        public string Location { get; set; }
    }

    public class ExistingMember
    {
        public string Id { get; set; }
        public string Name { get; set; }
    }
}