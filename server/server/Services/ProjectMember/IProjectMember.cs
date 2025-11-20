namespace server.Models
{
    public interface IProjectMember
    {
        Task<Models.ProjectMember?> GetMemberAsync(int projectId, string userId);
    }
}
