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
                     opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.UserName : null));
    }
  }
}