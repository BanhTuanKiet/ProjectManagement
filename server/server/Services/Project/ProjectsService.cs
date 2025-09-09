using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class ProjectsService : IProjects
    {
        public readonly  ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public ProjectsService(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
    }
}
