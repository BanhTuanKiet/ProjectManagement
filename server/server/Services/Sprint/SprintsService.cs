using AutoMapper;
using Microsoft.EntityFrameworkCore;
using server.Configs;
using server.DTO;
using server.Models;

namespace server.Services.Sprint
{
    public class SprintServices : ISprints
    {
        private readonly ProjectManagementContext _context;
        private readonly IMapper _mapper;

        public SprintServices(ProjectManagementContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }

        public async Task<List<SprintDTO.BasicSprint>> GetAll(int projectId)
        {
            var sprints = await _context.Sprints
                .Include(s => s.Tasks)
                .Where(s => s.ProjectId == projectId)
                .ToListAsync();

            return _mapper.Map<List<SprintDTO.BasicSprint>>(sprints);
        }

        public async Task<SprintDTO.BasicSprint?> GetById(int sprintId)
        {
            var sprint = await _context.Sprints
                .Include(s => s.Tasks)
                .FirstOrDefaultAsync(s => s.SprintId == sprintId);

            return sprint == null ? null : _mapper.Map<SprintDTO.BasicSprint>(sprint);
        }

        public async Task<Models.Sprint> Create(int projectId, SprintDTO.Create dto)
        {
            var sprint = new Models.Sprint
            {
                ProjectId = projectId,
                Name = dto.Name,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate
            };

            _context.Sprints.Add(sprint);
            await _context.SaveChangesAsync();
            return sprint;
        }

        public async Task<Models.Sprint?> Update(int sprintId, SprintDTO.Update dto)
        {
            var sprint = await _context.Sprints.FindAsync(sprintId);
            if (sprint == null) return null;

            if (!string.IsNullOrEmpty(dto.Name)) sprint.Name = dto.Name;
            if (dto.StartDate.HasValue) sprint.StartDate = dto.StartDate;
            if (dto.EndDate.HasValue) sprint.EndDate = dto.EndDate;

            await _context.SaveChangesAsync();
            return sprint;
        }

        public async Task<bool> Delete(int sprintId)
        {
            var sprint = await _context.Sprints.FindAsync(sprintId);
            if (sprint == null) return false;

            _context.Sprints.Remove(sprint);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<int> DeleteBulk(int projectId, List<int> SprintIds)
        {
            Console.WriteLine($"Deleting sprints with IDs: {string.Join(", ", SprintIds)} for project ID: {projectId}");
            var sprints = await _context.Sprints
                .Where(s => s.ProjectId == projectId && SprintIds.Contains(s.SprintId))
                .ToListAsync();
            // if (sprints.Count == 0)
            //     throw new ErrorException(404, "No sprints found to delete");
            _context.Sprints.RemoveRange(sprints);
            await _context.SaveChangesAsync();
            return sprints.Count;
        }
    }
}
