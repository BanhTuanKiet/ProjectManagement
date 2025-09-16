using AutoMapper;
using server.DTO;
using server.Models;

namespace server.Configs
{
  public class AutoMapperConfig : Profile
  {
    public AutoMapperConfig()
    {
      CreateMap<server.Models.Task, TaskDTO.BasicTask>()
          .ForMember(dest => dest.Assignee,
                    opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.UserName : null))
          .ForMember(dest => dest.CreatedBy,
                    otp => otp.MapFrom(src => src.CreatedBy != null ? src.CreatedByNavigation.UserName : null));

      CreateMap<server.Models.Project, ProjectDTO.ProjectTitile>();

            CreateMap<ProjectMember, ProjectDTO.ProjectMembers>()
                .ForMember(dest => dest.name,
                           opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.role,
                           opt => opt.MapFrom(src => src.RoleInProject))
                .ForMember(dest => dest.isOwner,
                           opt => opt.MapFrom(src => src.RoleInProject == "Project Manager"));

        }
    }
}