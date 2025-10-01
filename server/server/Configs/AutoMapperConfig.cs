using AutoMapper;
using server.DTO;
using server.Models;

namespace server.Configs
{
    public class AutoMapperConfig : Profile
    {
        public AutoMapperConfig()
        {
            CreateMap<Models.Task, TaskDTO.BasicTask>()
                .ForMember(dest => dest.Assignee,
                          opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.UserName : null))
                .ForMember(dest => dest.CreatedBy,
                          otp => otp.MapFrom(src => src.CreatedBy != null ? src.CreatedByNavigation.UserName : null));

            CreateMap<Project, ProjectDTO.ProjectTitile>();

            CreateMap<ProjectMember, ProjectDTO.ProjectMembers>()
                .ForMember(dest => dest.name,
                           opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.role,
                           opt => opt.MapFrom(src => src.RoleInProject))
                .ForMember(dest => dest.isOwner,
                           opt => opt.MapFrom(src => src.RoleInProject == "Project Manager"));

            CreateMap<SubTask, SubTaskDTO.BasicSubTask>()
                .ForMember(dest => dest.Assignee,
                           opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.UserName : null));

            CreateMap<SubTaskDTO.CreateSubTask, SubTask>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<Notification, NotificationDTO.NotificationBasic>()
                .ForMember(dest => dest.AssigneeId,
                            opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.Assignee,
                            opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.CreatedId,
                            opt => opt.MapFrom(src => src.CreatedBy.Id))
                .ForMember(dest => dest.CreatedBy,
                            opt => opt.MapFrom(src => src.CreatedBy.UserName));
        }
    }
}