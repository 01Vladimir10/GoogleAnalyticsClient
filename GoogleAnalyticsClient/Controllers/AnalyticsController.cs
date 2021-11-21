using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Web.Mvc;
using GoogleAnalyticsClient.Mode;

namespace GoogleAnalyticsClient.Controllers
{
    public class AnalyticsController : Controller
    {
        public ActionResult Index()
        {
            return View(CreateMockData());
        }
        
        [HttpGet]
        public ActionResult GenerateAnalyticsReport(DateTime startDate = default, DateTime endDate = default)
        {
            var data = CreateMockData(startDate, endDate);
            return Json(data, JsonRequestBehavior.AllowGet);
        }
        

        private static AnalyticsReportModel CreateMockData(DateTime startDate = default, DateTime endDate = default)
        {
            var headers = new List<AnalyticsReportColumnHeader>
            {
                new AnalyticsReportColumnHeader
                {
                    Name = "Date",
                    DisplayName = "Fecha"
                },
                new AnalyticsReportColumnHeader
                {
                    Name = "NewUsers",
                    DisplayName = "Usuarios nuevos"
                },
                new AnalyticsReportColumnHeader
                {
                    Name = "Sessions",
                    DisplayName = "Sesiones"
                },
                new AnalyticsReportColumnHeader
                {
                    Name = "AvgPageViews",
                    DisplayName = "Promedio de vista de paginas"
                },
            };
            var data = new Dictionary<string, List<dynamic>>();
            headers.ForEach(h => data[h.Name] = new List<dynamic>());
            
            var headers2 = headers.Where(h => h.Name != "Date").ToList();
            var rand = new Random();
            startDate = startDate == default ?  DateTime.Now.AddDays(-30) : startDate;
            endDate = endDate == default ? DateTime.Now : endDate;
            do
            {
                data["Date"].Add(startDate.ToString(CultureInfo.CurrentCulture));
                headers2.ForEach(h => data[h.Name].Add(10 + rand.NextDouble() % 90));
                startDate = startDate.AddDays(1);
            } while (startDate < endDate);

            return new AnalyticsReportModel
            {
                ColumnHeaders = headers,
                Data = data
            };
        }
    }
    
}