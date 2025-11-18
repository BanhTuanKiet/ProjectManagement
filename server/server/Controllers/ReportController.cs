using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using server.Configs;
using Microsoft.EntityFrameworkCore;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using System.Text;
using server.Models;
using server.Util;

[ApiController]
[Route("[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ProjectManagementContext _context;
    private readonly Cloudinary _cloudinary;
    private readonly IConfiguration _configuration;

    public ReportsController(ProjectManagementContext context, Cloudinary cloudinary, IConfiguration configuration)
    {
        _context = context;
        _cloudinary = cloudinary;
        _configuration = configuration;
    }

    [HttpPost("export")]
    public async Task<IActionResult> ExportReport(int projectId)
    {
        // Lọc task theo projectId
        var tasks = await _context.Tasks
            .Where(t => t.ProjectId == projectId) // ✅ Chỉ lấy task của project này
            .Include(t => t.Assignee)
            .ToListAsync();

        var sb = new StringBuilder();
        sb.AppendLine("TaskId,Title,Status,Assignee,CreatedAt");

        foreach (var t in tasks)
        {
            sb.AppendLine($"{t.TaskId},{t.Title},{t.Status},{t.Assignee?.UserName},{t.CreatedAt:yyyy-MM-dd}");
        }

        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        using var stream = new MemoryStream(bytes);

        var uploadParams = new RawUploadParams
        {
            File = new FileDescription("report.csv", stream),
            Folder = "reports"
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        var fileUrl = uploadResult.SecureUrl.ToString();

        return Ok(new { url = fileUrl });
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendReport([FromBody] SendReportDTO dto)
    {
        var managerEmail = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == dto.ProjectId && pm.RoleInProject == "Project Manager")
            .Select(pm => pm.User.Email)
            .FirstOrDefaultAsync();
        Console.WriteLine("AAAAAAAAAAAAAAAAA"+managerEmail);
        if (managerEmail == null)
            throw new ErrorException(404, "No Project Manager found for this project");

        await EmailUtils.SendEmailAsync(
            _configuration,
            managerEmail,
            "Project Task Report",
            $"Dưới đây là file report task:<br><br><a href='{dto.FileUrl}'>Download Report</a>"
        );

        return Ok(new { message = "Email sent" });
    }
}

public class SendReportDTO
{
    public string FileUrl { get; set; } = "";
    public int ProjectId { get; set; }
}