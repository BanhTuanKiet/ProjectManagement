// using AutoMapper;
// using Microsoft.EntityFrameworkCore;
// using server.DTO;
// using server.Models;

// namespace server.Services.Backlog
// {
//     public class BacklogServices : IBacklogs
//     {
//         private readonly ProjectManagementContext _context;
//         private readonly IMapper _mapper;

//         public BacklogServices(ProjectManagementContext context, IMapper mapper)
//         {
//             _context = context;
//             _mapper = mapper;
//         }

//         public async Task<List<BacklogDTO.BasicBacklog>> GetAll(int projectId)
//         {
//             var backlogs = await _context.Backlogs
//                 .Include(b => b.Tasks)
//                 .Where(b => b.ProjectId == projectId)
//                 .ToListAsync();

//             return _mapper.Map<List<BacklogDTO.BasicBacklog>>(backlogs);
//         }

//         public async Task<BacklogDTO.BasicBacklog?> GetById(int backlogId)
//         {
//             var backlog = await _context.Backlogs
//                 .Include(b => b.Tasks)
//                 .FirstOrDefaultAsync(b => b.BacklogId == backlogId);

//             return backlog == null ? null : _mapper.Map<BacklogDTO.BasicBacklog>(backlog);
//         }

//         public async Task<Models.Backlog> Create(int projectId, BacklogDTO.Create dto)
//         {
//             var backlog = new Models.Backlog
//             {
//                 ProjectId = projectId,
//                 Name = dto.Name,
//                 Description = dto.Description,
//                 CreatedAt = DateOnly.FromDateTime(DateTime.UtcNow),
//                 DueDate = dto.DueDate
//             };

//             _context.Backlogs.Add(backlog);
//             await _context.SaveChangesAsync();
//             return backlog;
//         }

//         public async Task<Models.Backlog?> Update(int backlogId, BacklogDTO.Update dto)
//         {
//             var backlog = await _context.Backlogs.FindAsync(backlogId);
//             if (backlog == null) return null;

//             if (!string.IsNullOrEmpty(dto.Name)) backlog.Name = dto.Name;
//             if (!string.IsNullOrEmpty(dto.Description)) backlog.Description = dto.Description;
//             if (dto.DueDate.HasValue) backlog.DueDate = dto.DueDate;

//             await _context.SaveChangesAsync();
//             return backlog;
//         }

//         public async Task<bool> Delete(int backlogId)
//         {
//             var backlog = await _context.Backlogs.FindAsync(backlogId);
//             if (backlog == null) return false;

//             _context.Backlogs.Remove(backlog);
//             await _context.SaveChangesAsync();
//             return true;
//         }
//     }
// }
