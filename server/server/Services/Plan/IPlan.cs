using server.DTO;

namespace server.Models
{
    public interface IPlans
    {
        Task<List<PlanDTO.PlanDetail>> GetPlans();
    }
}
