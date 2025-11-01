using AutoMapper;
using server.DTO;

namespace server.Services.Sprint
{
    public interface ISprints
    {
        Task<List<SprintDTO.BasicSprint>> GetAll(int projectId);
        Task<SprintDTO.BasicSprint?> GetById(int sprintId);
        Task<Models.Sprint> Create(int projectId, SprintDTO.Create dto);
        Task<Models.Sprint?> Update(int sprintId, SprintDTO.Update dto);
        Task<bool> Delete(int sprintId);
        Task<int> DeleteBulk(int projectId, List<int> SprintIds);
    }
}
