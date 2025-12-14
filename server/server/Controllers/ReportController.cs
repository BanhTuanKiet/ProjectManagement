using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using server.Models;
using server.DTO;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using OfficeOpenXml; // Thay cho ClosedXML
using OfficeOpenXml.Style;
using OfficeOpenXml.Drawing.Chart;
using System.Drawing; // Cần cho Color
using server.Util;
using server.Configs;
using server.Services.Task;
using System.Security.Claims;

[ApiController]
[Route("[controller]")]
public class ReportsController : ControllerBase
{
    private readonly ProjectManagementContext _context;
    private readonly CloudinaryDotNet.Cloudinary _cloudinary;
    private readonly IConfiguration _configuration;
    private readonly ITeams _teamServices;
    private readonly ITasks _tasksService;
    private readonly IProjects _projectsServices;



    public ReportsController(ProjectManagementContext context, CloudinaryDotNet.Cloudinary cloudinary, IConfiguration configuration, ITeams teamServices, ITasks tasksService, IProjects projectsServices)
    {
        _context = context;
        _cloudinary = cloudinary;
        _configuration = configuration;
        _teamServices = teamServices;
        _tasksService = tasksService;
        _projectsServices = projectsServices;
    }

    private Color GetStatusColor(string status)
    {
        string hexCode = status.ToLower() switch
        {
            "todo" => "#DBEAFE",
            "in progress" => "#FEF3C7",
            "done" => "#DCFCE7",
            "bug" => "#EDE9FE",
            "cancel" => "#FFEDD5",
            "expired" => "#FEE2E2",
            _ => "#FFFFFF"
        };
        return ColorTranslator.FromHtml(hexCode);
    }


    [HttpPost("export")]
    public async Task<IActionResult> ExportReport(int projectId)
    {
        ExcelPackage.License.SetNonCommercialPersonal("ProjectManagement");
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        string userRole = await _projectsServices.GetProjectRole(userId, projectId)
            ?? throw new ErrorException(404, "Member not found");
        List<server.Models.Task> tasks = new List<server.Models.Task>();
        if (userRole == "Project Manager")
        {
            tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId)
                .Include(t => t.Assignee)
                .ToListAsync();
        }
        else if (userRole == "Leader")
        {
            var members = await _teamServices.GetTeamMembers(userId, projectId);

            if (members == null) members = new List<string>();
            if (!members.Contains(userId)) members.Add(userId);

            tasks = await _context.Tasks
                .Where(t => t.ProjectId == projectId && members.Contains(t.AssigneeId))
                .Include(t => t.Assignee)
                .ToListAsync();
        }

        using var package = new ExcelPackage();

        /* ================== SHEET 1: OVERVIEW ================== */
        var overview = package.Workbook.Worksheets.Add("Overview");

        overview.Cells["A1"].Value = "Metric";
        overview.Cells["B1"].Value = "Value";
        overview.Cells["A1:B1"].Style.Font.Bold = true;

        var statusGroup = tasks
            .GroupBy(t => t.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToList();

        int row = 2;
        overview.Cells[row++, 1].Value = "Total Tasks";
        overview.Cells[row - 1, 2].Value = tasks.Count;

        foreach (var s in statusGroup)
        {
            overview.Cells[row, 1].Value = s.Status;
            overview.Cells[row, 2].Value = s.Count;
            row++;
        }

        overview.Cells.AutoFitColumns();

        /* ================== SHEET 2: TASK LIST ================== */
        var sheet = package.Workbook.Worksheets.Add("Task List");

        string[] headers =
        {
            "Task ID", "Title", "Status", "Priority",
            "Assignee", "Created At", "Deadline"
        };

        for (int i = 0; i < headers.Length; i++)
        {
            var cell = sheet.Cells[1, i + 1];
            cell.Value = headers[i];
            cell.Style.Font.Bold = true;
            cell.Style.Fill.PatternType = ExcelFillStyle.Solid;
            cell.Style.Fill.BackgroundColor.SetColor(Color.LightGray);
        }

        sheet.View.FreezePanes(2, 1); // Freeze row 1

        int r = 2;
        foreach (var t in tasks)
        {
            sheet.Cells[r, 1].Value = t.TaskId;
            sheet.Cells[r, 2].Value = t.Title;
            sheet.Cells[r, 3].Value = t.Status;
            sheet.Cells[r, 4].Value = t.Priority;
            sheet.Cells[r, 5].Value = t.Assignee?.UserName;
            sheet.Cells[r, 6].Value = t.CreatedAt.ToString("yyyy-MM-dd");
            sheet.Cells[r, 7].Value = t.Deadline?.ToString("yyyy-MM-dd");

            // Conditional color
            var range = sheet.Cells[r, 1, r, 7];
            range.Style.Fill.PatternType = ExcelFillStyle.Solid;
            range.Style.Fill.BackgroundColor.SetColor(GetStatusColor(t.Status));

            r++;
        }
        sheet.Cells.AutoFitColumns();

        var summarySheet = package.Workbook.Worksheets.Add("Status Summary");

        summarySheet.Cells["A1"].Value = "Status";
        summarySheet.Cells["B1"].Value = "Count";
        summarySheet.Cells["A1:B1"].Style.Font.Bold = true;

        var statusStats = tasks
            .GroupBy(t => t.Status)
            .Select(g => new
            {
                Status = g.Key,
                Count = g.Count()
            })
            .ToList();

        int ro = 2;
        foreach (var s in statusStats)
        {
            summarySheet.Cells[ro, 1].Value = s.Status;
            summarySheet.Cells[ro, 2].Value = s.Count;
            // Color cell status
            summarySheet.Cells[ro, 1].Style.Fill.PatternType = ExcelFillStyle.Solid;
            summarySheet.Cells[ro, 1].Style.Fill.BackgroundColor.SetColor(GetStatusColor(s.Status));
            ro++;
        }
        summarySheet.Cells.AutoFitColumns();

        int lastRow = ro - 1;
        if (lastRow >= 2) // Chỉ tạo chart nếu có dữ liệu
        {
            var pieChart = summarySheet.Drawings.AddChart("StatusChart", eChartType.Pie) as ExcelPieChart;
            
            pieChart.Series.Add(summarySheet.Cells[2, 2, lastRow, 2], summarySheet.Cells[2, 1, lastRow, 1]);
            pieChart.Title.Text = "Task Status Distribution";
            pieChart.SetPosition(0, 4, 0, 4); // Đặt vị trí chart (Row 0, Offset 4px...)
            pieChart.SetSize(400, 300);
            pieChart.DataLabel.ShowPercent = true; 
        }

        /* ================== EXPORT ================== */
        var stream = new MemoryStream();
        await package.SaveAsAsync(stream); // EPPlus hỗ trợ async save
        stream.Position = 0;

        return File(
            stream.ToArray(),
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            $"Project_{projectId}_Report.xlsx"
        );
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendReport([FromForm] ReportDTO.SendReportForm form, int projectId)
    {
        if (form.File == null || form.File.Length == 0)
            throw new ErrorException(400, "No file uploaded");
        string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        string userRole = await _projectsServices.GetProjectRole(userId, projectId)
            ?? throw new ErrorException(404, "Member not found");
        var user = _context.Users.FirstOrDefault(x => x.Id == userId);
        if(userRole != "Leader")
            throw new ErrorException(403, "Only Leader can send report");

        // Upload Cloudinary
        using var stream = form.File.OpenReadStream();

        var uploadParams = new RawUploadParams
        {
            File = new FileDescription(form.File.FileName, stream),
            Folder = "reports"
        };

        var uploadResult = await _cloudinary.UploadAsync(uploadParams);
        var fileUrl = uploadResult.SecureUrl.ToString();

        // Get Project Manager email
        var managerEmail = await _context.ProjectMembers
            .Where(pm => pm.ProjectId == form.ProjectId && pm.RoleInProject == "Project Manager")
            .Select(pm => pm.User.Email)
            .FirstOrDefaultAsync();

        if (managerEmail == null)
            throw new ErrorException(404, "No Project Manager found");

        await EmailUtils.SendEmailAsync(
            _configuration,
            managerEmail,
            "Project Task Report",
            "this is the project progress report from leader " + user?.UserName + ".<br>"+
            $"Report của project:<br><a href='{fileUrl}'>Download file</a>"
        );

        return Ok(new { message = "Report sent successfully" });
    }

    // [HttpPost("send")]
    // public async Task<IActionResult> SendReport([FromForm] ReportDTO.SendReportForm form, int projectId)
    // {
    //     if (form.File == null || form.File.Length == 0)
    //         throw new ErrorException(400, "No file uploaded");
    //     string userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    //     string userRole = await _projectsServices.GetProjectRole(userId, projectId)
    //         ?? throw new ErrorException(404, "Member not found");
    //     var user = _context.Users.FirstOrDefault(x => x.Id == userId);
    //     if(userRole != "Leader")
    //         throw new ErrorException(403, "Only Leader can send report");

    //     // 1. Lấy mail Manager
    //     var managerEmail = await _context.ProjectMembers
    //         .Where(pm => pm.ProjectId == form.ProjectId && pm.RoleInProject == "Project Manager")
    //         .Select(pm => pm.User.Email)
    //         .FirstOrDefaultAsync();

    //     if (managerEmail == null)
    //         throw new ErrorException(404, "No Project Manager found");

    //     // 2. Mở Stream từ file upload
    //     using var stream = form.File.OpenReadStream();

    //     // 3. Gọi hàm gửi mail MỚI vừa tạo
    //     await EmailUtils.SendEmailWithAttachmentAsync(
    //         _configuration,
    //         managerEmail,
    //         "Project Task Report",
    //         $"Đây là file báo cáo tiến độ dự án của leader {user?.UserName} (đính kèm).",
    //         stream,                 // Stream file
    //         form.File.FileName      // Tên file (vd: report.xlsx)
    //     );

    //     return Ok(new { message = "Report sent successfully via email attachment" });
    // }
}