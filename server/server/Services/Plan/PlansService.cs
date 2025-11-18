using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;

namespace server.Services.Project
{
    public class PlanServices : IPlans
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public PlanServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<PlanDTO.PlanDetail>> GetPlans()
        {
            var plans = await _context.Plans
                .Include(p => p.PlanFeatures)
                    .ThenInclude(pf => pf.Features)
                .ToListAsync();

            return _mapper.Map<List<PlanDTO.PlanDetail>>(plans);
        }

        public async Task<PlanFeatures> FindPlanFeature(int planId, int featureId)
        {
            return await _context.PlanFeatures.FirstOrDefaultAsync(p => p.PlanId == planId && p.FeatureId == featureId);
        }
    }
}
