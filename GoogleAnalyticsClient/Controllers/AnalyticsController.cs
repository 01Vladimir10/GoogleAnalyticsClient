using System;
using System.Collections.Generic;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
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
            var htmlTable = PartialView("_AnalyticsReportsTable", data).RenderToString();
            return Json(new
            {
                data, htmlTable
            }, JsonRequestBehavior.AllowGet);
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
    
    public static class ViewExtensions
    {
        public static string RenderToString(this PartialViewResult partialView)
        {
            var httpContext = HttpContext.Current;

            if (httpContext == null)
            {
                throw new NotSupportedException("An HTTP context is required to render the partial view to a string");
            }

            var controllerName = httpContext.Request.RequestContext.RouteData.Values["controller"].ToString();

            var controller = (ControllerBase)ControllerBuilder.Current.GetControllerFactory().CreateController(httpContext.Request.RequestContext, controllerName);

            var controllerContext = new ControllerContext(httpContext.Request.RequestContext, controller);

            var view = ViewEngines.Engines.FindPartialView(controllerContext, partialView.ViewName).View;

            var sb = new StringBuilder();

            using (var sw = new StringWriter(sb))
            {
                using (var tw = new HtmlTextWriter(sw))
                {
                    view.Render(new ViewContext(controllerContext, view, partialView.ViewData, partialView.TempData, tw), tw);
                }
            }
            return sb.ToString();
        }
    }

    
    
}