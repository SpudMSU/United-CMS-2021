using System.IO;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.AspNetCore.Mvc.ViewEngines;
using Microsoft.AspNetCore.Mvc.ViewFeatures;

namespace united_airlines_training.Helpers
{
    /// <summary>
    /// Author: Chris Nosowsky
    /// <br></br>
    /// Given a HTML view, it renders that view to be parseable in an email
    /// </summary>
    public class EmailHelper
    {
        public static string RenderView(Controller controller, string viewName, object model)
        {
            controller.ViewData.ModelState.Clear(); // clear any previous model states
            controller.ViewData.Model = model;

            using (var sw = new StringWriter())
            {
                ViewEngineResult viewResult = null;
                var engine = controller.HttpContext.RequestServices.GetService(typeof(ICompositeViewEngine)) as ICompositeViewEngine;

                viewResult = engine.FindView(controller.ControllerContext, viewName, false);

                var viewContext = new ViewContext(controller.ControllerContext, viewResult.View, controller.ViewData, controller.TempData, sw, new HtmlHelperOptions());
                viewResult.View.RenderAsync(viewContext);

                return sw.GetStringBuilder().ToString();

            }
        }
    }
}
