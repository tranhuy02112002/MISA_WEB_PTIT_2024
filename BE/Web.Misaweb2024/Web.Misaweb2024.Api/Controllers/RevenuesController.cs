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
                    // Lợi nhuận hôm nay từ cả 2 bảng
                    var todayProfitQuery = @"
                        SELECT SUM(TotalAmount) AS TodayProfit
                        FROM (
                            SELECT TotalAmount FROM `order` WHERE DATE(PaymentDate) = CURDATE() AND Status = 'Đã thanh toán'
                            UNION ALL
                            SELECT Totalamout FROM onlineorder WHERE DATE(Orderdate) = CURDATE() AND Status = 'Đã thanh toán'
                        ) AS combined_orders";
                    var todayProfit = connection.QueryFirstOrDefault<decimal?>(todayProfitQuery) ?? 0;

                    // Tổng doanh thu từ cả 2 bảng
                    var totalRevenueQuery = @"
                    SELECT SUM(TotalAmount) AS TotalRevenue
                    FROM (
                        SELECT TotalAmount FROM `order` WHERE Status = 'Đã thanh toán'
                        UNION ALL
                        SELECT Totalamout FROM onlineorder WHERE Status = 'Đã thanh toán'
                    ) AS combined_orders";
                    var totalRevenue = connection.QueryFirstOrDefault<decimal?>(totalRevenueQuery) ?? 0;

                    // Số đơn order hôm nay từ cả 2 bảng
                    var todayOrdersQuery = @"
                        SELECT COUNT(DISTINCT OrderID) AS TodayOrders
                        FROM (
                            SELECT OrderID FROM `order` WHERE DATE(PaymentDate) = CURDATE() AND Status = 'Đã thanh toán'
                            UNION ALL
                            SELECT OrderonlineId AS OrderID FROM onlineorder WHERE DATE(Orderdate) = CURDATE() AND Status = 'Đã thanh toán'
                        ) AS combined_orders";
                    var todayOrders = connection.QueryFirstOrDefault<int>(todayOrdersQuery);

                    // Số món order hôm nay từ cả 2 bảng
                    var todayOrdersFoodQuery = @"
                        SELECT COUNT(*) AS TodayOrders
                        FROM (
                            SELECT od.FoodID FROM orderdetails od
                            JOIN `order` o ON od.OrderID = o.OrderID
                            WHERE DATE(o.PaymentDate) = CURDATE() AND o.Status = 'Đã thanh toán'
                            UNION ALL
                            SELECT od.FoodId AS FoodID FROM onlineorderdetail od
                            JOIN onlineorder o ON od.OnlineorderId = o.OrderonlineId
                            WHERE DATE(o.Orderdate) = CURDATE() AND o.Status = 'Đã thanh toán'
                        ) AS combined_foods";
                    var todayOrdersFood = connection.QueryFirstOrDefault<int>(todayOrdersFoodQuery);

                    // Top 3 món ăn doanh thu cao nhất từ cả 2 bảng
                    var topFoodsQuery = @"
                        SELECT f.FoodName AS Name, SUM(TotalPrice) AS Revenue
                        FROM (
                            SELECT od.TotalPrice, od.FoodID FROM orderdetails od
                            JOIN `order` o ON od.OrderID = o.OrderID
                            WHERE o.Status = 'Đã thanh toán'
                            UNION ALL
                            SELECT od.TotalPrice, od.FoodId AS FoodID FROM onlineorderdetail od
                            JOIN onlineorder o ON od.OnlineorderId = o.OrderonlineId
                            WHERE o.Status = 'Đã thanh toán'
                        ) AS combined_details
                        JOIN food f ON combined_details.FoodID = f.FoodID
                        GROUP BY f.FoodName
                        ORDER BY Revenue DESC
                        LIMIT 3";
                    var topFoods = connection.Query<dynamic>(topFoodsQuery);

                    // Biểu đồ doanh thu từ cả 2 bảng
                    var revenueChartQuery = @"
                        SELECT DATE(PaymentDate) AS Date, SUM(TotalAmount) AS Revenue
                        FROM `order`
                        WHERE PaymentDate >= CURDATE() - INTERVAL @Days DAY AND Status = 'Đã thanh toán'
                        GROUP BY DATE(PaymentDate)
                        UNION ALL
                        SELECT DATE(Orderdate) AS Date, SUM(Totalamout) AS Revenue
                        FROM onlineorder
                        WHERE Orderdate >= CURDATE() - INTERVAL @Days DAY AND Status = 'Đã thanh toán'
                        GROUP BY DATE(Orderdate)
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
