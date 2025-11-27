using server.DTO;

namespace server.Models
{
    public interface IMedia
    {
        Task<List<MediaDTO.Media>> GetMedias();
        Task<List<Contact>> PutContacts(List<MediaDTO.Contact> contacts, string userId);
    }
}
