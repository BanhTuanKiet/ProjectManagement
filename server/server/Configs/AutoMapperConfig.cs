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
                    opt => opt.MapFrom(src => src.CreatedBy)) // Lấy ID

                .ForMember(dest => dest.CreatedName,
                    opt => opt.MapFrom(src => src.CreatedByNavigation != null ? src.CreatedByNavigation.UserName : null));

            CreateMap<Project, ProjectDTO.ProjectTitile>();

            CreateMap<Project, ProjectDTO.ProjectBasic>()
                .ForMember(dest => dest.OwnerId,
                            opt => opt.MapFrom(src => src.CreatedBy))
                .ForMember(dest => dest.Owner,
                            opt => opt.MapFrom(src => src.CreatedByNavigation.UserName))
                .ForMember(dest => dest.Members,
                            opt => opt.MapFrom(src => src.ProjectMembers));

            CreateMap<ProjectMember, ProjectDTO.ProjectMembers>()
                .ForMember(dest => dest.name,
                            opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.email,
                            opt => opt.MapFrom(src => src.User.Email))
                .ForMember(dest => dest.role,
                            opt => opt.MapFrom(src => src.RoleInProject))
                .ForMember(dest => dest.isOwner,
                            opt => opt.MapFrom(src => src.RoleInProject == "Project Manager"))
                .ForMember(dest => dest.TeamId,
                    opt => opt.MapFrom(src =>
                        src.User.TeamMembers
                            .Where(tm => tm.Team.ProjectId == 2)
                            // .Where(tm => tm.Team.ProjectId == src.Project.ProjectId)
                            .Select(tm => tm.TeamId)
                            .FirstOrDefault()
                    ))
                .ForMember(dest => dest.LeaderId,
                    opt => opt.MapFrom(src =>
                        src.User.TeamMembers
                            .Where(tm => !string.IsNullOrEmpty(tm.Team.LeaderId))
                            .Select(tm => tm.Team.LeaderId)
                            .FirstOrDefault()
                    ));

            CreateMap<SubTask, SubTaskDTO.BasicSubTask>()
                .ForMember(dest => dest.Assignee,
                           opt => opt.MapFrom(src => src.Assignee != null ? src.Assignee.UserName : null));

            CreateMap<SubTaskDTO.CreateSubTask, SubTask>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateTime.UtcNow));

            CreateMap<SubTaskDTO.UpdateSubTask, SubTask>()
                .ForMember(dest => dest.Title,
                            opt => {
                                opt.Condition(src => src.Summary != null);
                                opt.MapFrom(src => src.Summary);
                            })
                .ForMember(dest => dest.Status,
                            opt => opt.Condition(src => src.Status != null))
                .ForMember(dest => dest.AssigneeId,
                            opt => opt.Condition(src => src.AssigneeId != null))
                .ForMember(dest => dest.Assignee, opt => opt.Ignore())
                .ForMember(dest => dest.Task, opt => opt.Ignore())
                .ForMember(dest => dest.SubTaskId, opt => opt.Ignore())
                .ForMember(dest => dest.CreatedAt, opt => opt.Ignore());

            CreateMap<Notification, NotificationDTO.NotificationBasic>()
                .ForMember(dest => dest.AssigneeId,
                            opt => opt.MapFrom(src => src.User.Id))
                .ForMember(dest => dest.Assignee,
                            opt => opt.MapFrom(src => src.User.UserName))
                .ForMember(dest => dest.CreatedId,
                            opt => opt.MapFrom(src => src.CreatedBy.Id))
                .ForMember(dest => dest.CreatedBy,
                            opt => opt.MapFrom(src => src.CreatedBy.UserName));

            CreateMap<Sprint, SprintDTO.BasicSprint>();
            CreateMap<SprintDTO.Create, Sprint>()
                .ForMember(dest => dest.SprintId, opt => opt.Ignore())
                .ForMember(dest => dest.Project, opt => opt.Ignore());

            CreateMap<SprintDTO.Update, Sprint>()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            // CreateMap<Backlog, BacklogDTO.BasicBacklog>();

            // CreateMap<BacklogDTO.Create, Backlog>()
            //     .ForMember(dest => dest.BacklogId, opt => opt.Ignore())
            //     .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(_ => DateOnly.FromDateTime(DateTime.UtcNow)));

            // CreateMap<BacklogDTO.Update, Backlog>()
            //     .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<Plans, PlanDTO.PlanDetail>()
                .ForMember(dest => dest.Id, opt => opt.MapFrom(src => src.PlanId))
                .ForMember(dest => dest.Features, opt => opt.MapFrom(src => src.PlanFeatures));

            CreateMap<PlanFeatures, PlanDTO.FeatureDetail>()
                .ForMember(dest => dest.FeatureId, opt => opt.MapFrom(src => src.FeatureId))
                .ForMember(dest => dest.ValueType, opt => opt.MapFrom(src => src.ValueType))
                .ForMember(dest => dest.Value, opt => opt.MapFrom(src => src.Value))
                .ForMember(dest => dest.FeatureName, opt => opt.MapFrom(src => src.Features.Name));

            CreateMap<ApplicationUser, UserDTO.UserProfile>().ReverseMap()
                .ForAllMembers(opt => opt.Condition((src, dest, srcMember) => srcMember != null));

            CreateMap<ApplicationUser, UserDTO.AvailableMember>()
                .ForMember(dest => dest.MemberId, opt => opt.MapFrom(src => src.Id))
                .ForMember(dest => dest.MemberName, opt => opt.MapFrom(src => src.UserName));
        }
    }
}