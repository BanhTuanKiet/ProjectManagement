using server.DTO;

namespace server.Models
{
    public interface IFeature
    {
        Task<Features> FindFeatureByName(string name);
    }
}
