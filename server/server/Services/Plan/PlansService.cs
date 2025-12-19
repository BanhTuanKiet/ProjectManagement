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
                .Include(p => p.Subscriptions)
                .ToListAsync();

            return _mapper.Map<List<PlanDTO.PlanDetail>>(plans);
        }

        public async Task<PlanFeatures> FindPlanFeature(int planId, int featureId)
        {
            return await _context.PlanFeatures.FirstOrDefaultAsync(p => p.PlanId == planId && p.FeatureId == featureId);
        }

        public async Task<Plans> FindPlanById(int planId)
        {
            return await _context.Plans
                .Include(p => p.PlanFeatures)
                    .ThenInclude(pf => pf.Features)
                .Include(p => p.Subscriptions)
                .FirstOrDefaultAsync(p => p.PlanId == planId);
        }

        public async Task<Plans> PutPlan(Plans plan, PlanDTO.EditPlan editPlan)
        {
            if (editPlan.Name != null && editPlan.Name != plan.Name)
            {
                plan.Name = editPlan.Name;
            }

            if (editPlan.Price.HasValue && editPlan.Price.Value != plan.Price)
            {
                plan.Price = editPlan.Price.Value;
            }

            if (editPlan.Description != null && editPlan.Description != plan.Description)
            {
                plan.Description = editPlan.Description;
            }

            if (editPlan.Badge.HasValue && editPlan.Badge.Value != plan.Badge)
            {
                plan.Badge = editPlan.Badge.Value;
            }

            if (editPlan.IsActive.HasValue && editPlan.IsActive.Value != plan.IsActive)
            {
                plan.IsActive = editPlan.IsActive.Value;
            }

            if (editPlan.Features != null && editPlan.Features.Any())
            {
                foreach (var editFeature in editPlan.Features)
                {
                    var feature = plan.PlanFeatures
                        .FirstOrDefault(f => f.FeatureId == editFeature.FeatureId);

                    if (feature != null)
                    {
                        if (feature.Value != editFeature.Value ||
                            feature.ValueType != editFeature.ValueType)
                        {
                            feature.Value = editFeature.Value;
                            feature.ValueType = editFeature.ValueType;
                        }
                    }
                    else
                    {
                        plan.PlanFeatures.Add(new PlanFeatures
                        {
                            PlanId = plan.PlanId,
                            FeatureId = editFeature.FeatureId,
                            ValueType = editFeature.ValueType,
                            Value = editFeature.Value
                        });
                    }
                }
            }

            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task<Plans> ToggleActive(Plans plan)
        {
            bool isActive = !plan.IsActive;
            plan.IsActive = isActive;
            await _context.SaveChangesAsync();
            return plan;
        }
    }
}
