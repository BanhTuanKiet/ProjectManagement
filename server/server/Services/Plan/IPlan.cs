using server.DTO;

namespace server.Models
{
    public interface IPlans
    {
        Task<List<PlanDTO.PlanDetail>> GetPlans();
        Task<PlanFeatures> FindPlanFeature(int planId, int feature);
        Task<Plans> FindPlanById(int planId);
        Task<Plans> PutPlan(Plans plan, PlanDTO.EditPlan editPlan);
        Task<Plans> ToggleActive(Plans plan);
    }
}
