using System.Collections.Generic;
using Newtonsoft.Json;

namespace GoogleAnalyticsClient.Mode
{
    public class AnalyticsReportColumnHeader
    {
        public string Name { get; set; }
        public string DisplayName { get; set; }
    }
    public class AnalyticsReportModel
    {
        public List<AnalyticsReportColumnHeader> ColumnHeaders { get; set; }
        public IDictionary<string, List<dynamic>> Data { get; set; }
        public IDictionary<string, List<dynamic>> AlternativeDimensionsData { get; set; }
        public List<string> AlternativeDimensionHeaders { get; set; }

        public AnalyticsReportModel()
        {
            AlternativeDimensionsData = new Dictionary<string, List<dynamic>>();
            AlternativeDimensionHeaders = new List<string>();
            ColumnHeaders = new List<AnalyticsReportColumnHeader>();
            Data = new Dictionary<string, List<dynamic>>();
        }

        public string ToJson()
        {
            var jsonConverter = new Newtonsoft.Json.Converters.StringEnumConverter();
            var serializerSettings = new JsonSerializerSettings { Converters = new JsonConverter[] { jsonConverter } };
            return JsonConvert.SerializeObject(this, serializerSettings); 
        }
    }
}