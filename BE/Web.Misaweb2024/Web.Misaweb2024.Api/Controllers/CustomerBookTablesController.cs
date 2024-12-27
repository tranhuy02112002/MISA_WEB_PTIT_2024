using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using Web.Misaweb2024.Api.Model;
using System;
using System.Linq;

namespace Web.Misaweb2024.Api.Controllers
{
    public class CustomerBookTablesController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
