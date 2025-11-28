using System.Text.Json;
using AutoMapper;
using CloudinaryDotNet.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.DTO;
using server.Models;
using server.Util;

namespace server.Services.Project
{
    public class MediaService : IMedia
    {
        public readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;

        public MediaService(ProjectManagementContext context, IMapper mapper, IConfiguration configuration)
        {
            _context = context;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<List<MediaDTO.Media>> GetMedias()
        {
            var medias = await _context.Medias.ToListAsync();
            return _mapper.Map<List<MediaDTO.Media>>(medias);
        }

        public async Task<List<Contact>> PutContacts(List<MediaDTO.Contact> contacts, string userId)
        {
            var existingContacts = await _context.Contacts
                .Where(c => c.UserId == userId)
                .ToListAsync();

            var incomingMediaIds = contacts.Select(c => c.MediaId).ToList();

            var toDelete = existingContacts
                .Where(c => !incomingMediaIds.Contains(c.MediaId))
                .ToList();

            if (toDelete.Any())
            {
                _context.Contacts.RemoveRange(toDelete);

                existingContacts = existingContacts
                    .Where(c => incomingMediaIds.Contains(c.MediaId))
                    .ToList();
            }

            foreach (var contact in contacts)
            {
                var existingContact = existingContacts
                    .FirstOrDefault(c => c.MediaId == contact.MediaId);

                if (existingContact != null)
                {
                    existingContact.Url = contact.Url;
                }
                else
                {
                    var newContact = new Contact
                    {
                        MediaId = contact.MediaId,
                        Url = contact.Url,
                        UserId = userId
                    };

                    _context.Contacts.Add(newContact);
                    existingContacts.Add(newContact);
                }
            }

            await _context.SaveChangesAsync();

            return existingContacts;
        }
    }
}
