namespace server.DTO
{
    public class PlanDTO
    {
        public class PlanDetail
        {
            public int Id { get; set; }
            public string Name { get; set; }
            public decimal Price { get; set; }
            public string Description { get; set; }
            public bool Badge { get; set; }
            public List<FeatureDetail> Features { get; set; } = new();
        }

        public class FeatureDetail
        {
            public int FeatureId { get; set; }
            public string FeatureName { get; set; }
            public string ValueType { get; set; }
            public string Value { get; set; }
        }
    }
}
