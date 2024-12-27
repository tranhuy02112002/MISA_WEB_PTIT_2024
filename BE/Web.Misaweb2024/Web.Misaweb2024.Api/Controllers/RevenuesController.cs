using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Web.Misaweb2024.Api.Model;
using Dapper;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class RevenueController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        [HttpGet]
        public IActionResult GetRevenue([FromQuery] int days = 7)
        {
            try
            {
                using (var connection = new MySqlConnection(_connectionString))
                {
                    // Lợi nhuận hôm nay
                    var todayProfitQuery = @"
                        SELECT SUM(TotalAmount) AS TodayProfit
                        FROM `order`
                        WHERE DATE(PaymentDate) = CURDATE() AND Status = 'Đã thanh toán'";
                    var todayProfit = connection.QueryFirstOrDefault<decimal?>(todayProfitQuery) ?? 0;

                    // Tổng doanh thu
                    var totalRevenueQuery = @"
                    SELECT SUM(TotalAmount) AS TotalRevenue
                    FROM `order`
                    WHERE Status = 'Đã thanh toán'";
                    var totalRevenue = connection.QueryFirstOrDefault<decimal?>(totalRevenueQuery) ?? 0;

                    // Số đơn order hôm nay
                    var todayOrdersQuery1 = @"
                        SELECT COUNT(DISTINCT o.OrderID) AS TodayOrders
                        FROM `order` o
                        WHERE DATE(o.PaymentDate) = CURDATE() AND o.Status = 'Đã thanh toán'";
                    var todayOrders = connection.QueryFirstOrDefault<int>(todayOrdersQuery1);


                    // Số món order hôm nay
                    var todayOrdersFoodQuery = @"
                        SELECT COUNT(*) AS TodayOrders
                        FROM orderdetails od
                        JOIN `order` o ON od.OrderID = o.OrderID
                        WHERE DATE(o.PaymentDate) = CURDATE() AND o.Status = 'Đã thanh toán'";
                    var todayOrdersFood = connection.QueryFirstOrDefault<int>(todayOrdersFoodQuery);

                    // Top 3 món ăn doanh thu cao nhất
                    var topFoodsQuery = @"
                        SELECT f.FoodName AS Name, SUM(od.TotalPrice) AS Revenue
                        FROM orderdetails od
                        JOIN food f ON od.FoodID = f.FoodID
                        JOIN `order` o ON od.OrderID = o.OrderID
                        WHERE o.Status = 'Đã thanh toán'
                        GROUP BY f.FoodName
                        ORDER BY Revenue DESC
                        LIMIT 3";
                    var topFoods = connection.Query<dynamic>(topFoodsQuery);

                    // Biểu đồ doanh thu
                    var revenueChartQuery = @"
                        SELECT DATE(PaymentDate) AS Date, SUM(TotalAmount) AS Revenue
                        FROM `order`
                        WHERE PaymentDate >= CURDATE() - INTERVAL @Days DAY AND Status = 'Đã thanh toán'
                        GROUP BY DATE(PaymentDate)
                        ORDER BY Date ASC";
                    var revenueChartData = connection.Query(revenueChartQuery, new { Days = days });

                    var chartLabels = revenueChartData.Select(x => x.Date.ToString("yyyy-MM-dd")).ToList();
                    var chartData = revenueChartData.Select(x => x.Revenue).ToList();

                    return Ok(new
                    {
                        totalRevenue,
                        todayProfit,
                        todayOrders,
                        todayOrdersFood,
                        topFoods,
                        revenueChart = new
                        {
                            labels = chartLabels,
                            data = chartData
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi hệ thống: {ex.Message}");
            }
        }
    }
}
