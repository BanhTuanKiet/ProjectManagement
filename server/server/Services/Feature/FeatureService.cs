using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class FeatureServices : IFeature
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public FeatureServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<Features> FindFeatureByName(string name)
        {
            return await _context.Features.FirstOrDefaultAsync(f => f.Name == name);
        }
    }
}
