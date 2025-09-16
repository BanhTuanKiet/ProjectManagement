namespace server.DTO
{
  public class ProjectDTO
  {
    public class ProjectTitile
    {
      public int ProjectId { get; set; }
      public string Name { get; set; } = null!;
    }

    public class ProjectMembers
    {
      public string userId { get; set; }
      public string name { get; set; }
      public string role { get; set; }
      public bool isOwner { get; set; }
    }
  }
}