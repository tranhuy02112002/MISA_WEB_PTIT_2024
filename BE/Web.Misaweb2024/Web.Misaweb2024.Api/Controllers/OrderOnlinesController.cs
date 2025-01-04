using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrderOnlinesController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Tạo đơn hàng mới
        [HttpPost]
        public IActionResult CreateOrder([FromBody] OrderOnlineCreateDto orderDto)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    if (orderDto == null || !orderDto.OrderDetails.Any())
                    {
                        return BadRequest("Dữ liệu đơn hàng không hợp lệ.");
                    }

                    sqlConnection.Open();
                    using var transaction = sqlConnection.BeginTransaction();

                    try
                    {
                        var orderId = Guid.NewGuid();
                        var insertOrderQuery = @"
                            INSERT INTO onlineorder 
                            (OrderonlineId,UserId, Orderdate, Totalamout, Status, CustomerName, CustomerEmail, CustomerPhone, CustomerAddress)
                            VALUES 
                            (@OrderonlineId, @UserId,@Orderdate, @Totalamout, @Status, @CustomerName, @CustomerEmail, @CustomerPhone, @CustomerAddress)";

                        sqlConnection.Execute(insertOrderQuery, new
                        {
                            OrderonlineId = orderId,
                            UserId= orderDto.UserId,
                            Orderdate = DateTime.Now,
                            Totalamout = orderDto.OrderDetails.Sum(d => d.TotalPrice),
                            Status = "Chờ xác nhận",
                            orderDto.CustomerName,
                            orderDto.CustomerEmail,
                            orderDto.CustomerPhone,
                            orderDto.CustomerAddress
                        }, transaction);

                        var insertOrderDetailQuery = @"
                            INSERT INTO onlineorderdetail 
                            (OnlineorderdetailId, Quantity, Price, TotalPrice, OnlineorderId, FoodId)
                            VALUES 
                            (UUID(), @Quantity, @Price, @TotalPrice, @OnlineorderId, @FoodId)";

                        foreach (var detail in orderDto.OrderDetails)
                        {
                            sqlConnection.Execute(insertOrderDetailQuery, new
                            {
                                Quantity = detail.Quantity,
                                Price = detail.Price,
                                TotalPrice = detail.TotalPrice,
                                OnlineorderId = orderId,
                                FoodId = detail.FoodId
                            }, transaction);
                        }

                        transaction.Commit();

                        return Ok(new { OrderID = orderId, Message = "Tạo đơn hàng thành công" });
                    }
                    catch (Exception)
                    {
                        transaction.Rollback();
                        throw;
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }
        // Lấy danh sách đơn hàng
        [HttpGet]
        public IActionResult GetOrderHistory()
        {
            using (var sqlConnection = new MySqlConnection(_connectionString))
            {
                var query = "SELECT * FROM onlineorder";
                var orders = sqlConnection.Query(query);
                return Ok(orders);
            }
        }
        // Lấy danh sách đơn hàng theo UserId
        [HttpGet("user/{userId}")]
        public IActionResult GetOrderHistory(Guid userId)  // Nhận userId từ query string
        {
            using (var sqlConnection = new MySqlConnection(_connectionString))
            {
                // Câu truy vấn để lấy đơn hàng của user theo userId
                var query = "SELECT * FROM onlineorder WHERE userId = @UserId";

                // Thực thi truy vấn với tham số userId
                var orders = sqlConnection.Query(query, new { UserId = userId });

                return Ok(orders);
            }
        }
        // Lấy danh sách đơn hàng với trạng thái Đang giao hàng, Đang chuẩn bị hoặc Đã thanh toán
        [HttpGet("filter")]
        public IActionResult GetFilteredOrders()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Câu truy vấn để lấy đơn hàng với các trạng thái mong muốn
                    var query = @"
            SELECT *
            FROM onlineorder
            WHERE Status IN ('Đang giao hàng', 'Đang chuẩn bị', 'Đã thanh toán')";

                    // Thực thi câu truy vấn
                    var orders = sqlConnection.Query(query).ToList();

                    // Kiểm tra nếu không có đơn hàng nào
                    if (!orders.Any())
                    {
                        return NotFound("Không có đơn hàng nào với trạng thái yêu cầu.");
                    }

                    return Ok(orders);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }


        //Lấy ra thông tin chi tiết của đơn hàng
        [HttpGet("{orderId}")]
        public IActionResult GetOrderDetails(Guid orderId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Truy vấn thông tin đơn hàng từ bảng onlineorder
                    var orderQuery = @"
                    SELECT OrderonlineId, Orderdate, CustomerName, CustomerEmail, CustomerPhone, CustomerAddress, Totalamout, Status
                    FROM onlineorder
                    WHERE OrderonlineId = @OrderId";

                    var order = sqlConnection.QueryFirstOrDefault(orderQuery, new { OrderId = orderId });

                    if (order == null)
                    {
                        return NotFound("Đơn hàng không tồn tại.");
                    }

                    // Truy vấn chi tiết các món ăn trong đơn hàng từ bảng onlineorderdetail
                    var foodQuery = @"
                    SELECT f.FoodName AS FoodName, od.Quantity, od.Price, od.TotalPrice
                    FROM onlineorderdetail od
                    JOIN food f ON od.FoodId = f.FoodID
                    WHERE od.OnlineorderId = @OrderId";

                    var foods = sqlConnection.Query<OrderDetailDto1>(foodQuery, new { OrderId = orderId }).ToList();

                    // Tạo đối tượng chứa thông tin đơn hàng và danh sách món ăn
                    var orderDetails = new OrderOnlineDto
                    {
                        OrderId = order.OrderonlineId,
                        CustomerName = order.CustomerName,
                        CustomerEmail = order.CustomerEmail,
                        CustomerPhone = order.CustomerPhone,
                        CustomerAddress = order.CustomerAddress,
                        TotalAmount = order.Totalamout,
                        Status = order.Status,
                        Orderdate = order.Orderdate,
                        Foods = foods
                    };

                    return Ok(orderDetails);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        //Cập nhật trạng thái đơn hàng thành Đang chuẩn bị
        [HttpPut("{orderId}/approve")]
        public IActionResult ApproveOrder(Guid orderId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Câu truy vấn để cập nhật trạng thái đơn hàng
                    var query = @"
                    UPDATE onlineorder
                    SET Status = 'Đang chuẩn bị'
                    WHERE OrderonlineId = @OrderId AND Status = 'Chờ xác nhận'";

                    // Thực thi câu truy vấn
                    var rowsAffected = sqlConnection.Execute(query, new { OrderId = orderId });

                    // Kiểm tra xem có bản ghi nào bị ảnh hưởng không
                    if (rowsAffected > 0)
                    {
                        return Ok("Đơn hàng đã được duyệt và chuyển sang trạng thái 'Đang chuẩn bị'.");
                    }
                    else
                    {
                        return BadRequest("Chỉ có thể duyệt đơn hàng ở trạng thái 'Chờ xác nhận'.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }


        // Hủy đơn hàng
        [HttpPut("{orderId}/cancel")]
        public IActionResult CancelOrder(Guid orderId)
        {
            using (var sqlConnection = new MySqlConnection(_connectionString))
            {
                var query = @"
            UPDATE onlineorder
            SET Status = 'Đã hủy'
            WHERE OrderonlineId = @OrderId AND Status = 'Chờ xác nhận'";
                var rowsAffected = sqlConnection.Execute(query, new { OrderId = orderId });

                if (rowsAffected > 0)
                {
                    return Ok();
                }
                return BadRequest("Chỉ có thể hủy đơn hàng ở trạng thái 'Chờ xác nhận'.");
            }
        }
        // Cập nhật trạng thái đơn hàng thành Đang giao hàng
        [HttpPut("{orderId}/deliver")]
        public IActionResult DeliverOrder(Guid orderId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Câu truy vấn để cập nhật trạng thái đơn hàng
                    var query = @"
                    UPDATE onlineorder
                    SET Status = 'Đang giao hàng'
                    WHERE OrderonlineId = @OrderId AND Status = 'Đang chuẩn bị'";

                    // Thực thi câu truy vấn
                    var rowsAffected = sqlConnection.Execute(query, new { OrderId = orderId });

                    // Kiểm tra xem có bản ghi nào bị ảnh hưởng không
                    if (rowsAffected > 0)
                    {
                        return Ok("Đơn hàng đã được chuyển sang trạng thái 'Đang giao hàng'.");
                    }
                    else
                    {
                        return BadRequest("Chỉ có thể chuyển đơn hàng ở trạng thái 'Đang chuẩn bị' sang 'Đang giao hàng'.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // Cập nhật trạng thái đơn hàng thành Đã thanh toán
        [HttpPut("{orderId}/complete")]
        public IActionResult CompleteOrder(Guid orderId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Câu truy vấn để cập nhật trạng thái đơn hàng
                    var query = @"
                    UPDATE onlineorder
                    SET Status = 'Đã thanh toán'
                    WHERE OrderonlineId = @OrderId AND Status = 'Đang giao hàng'";

                    // Thực thi câu truy vấn
                    var rowsAffected = sqlConnection.Execute(query, new { OrderId = orderId });

                    // Kiểm tra xem có bản ghi nào bị ảnh hưởng không
                    if (rowsAffected > 0)
                    {
                        return Ok("Đơn hàng đã được chuyển sang trạng thái 'Đã thanh toán'.");
                    }
                    else
                    {
                        return BadRequest("Chỉ có thể chuyển đơn hàng ở trạng thái 'Đang giao hàng' sang 'Đã thanh toán'.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }




    }
    public class OrderOnlineDto
    {
        public Guid OrderId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime Orderdate { get; set; }
        public string Status { get; set; }
        public List<OrderDetailDto1> Foods { get; set; }  // Danh sách món ăn
    }

    public class OrderDetailDto1
    {
        public string FoodName { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
    }

    public class OrderOnlineCreateDto
    {
        public Guid UserId { get; set; }   
        public string CustomerName { get; set; }
        public string CustomerEmail { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerAddress { get; set; }
        public List<OrderOnlineDetailDto> OrderDetails { get; set; }
    }

    public class OrderOnlineDetailDto
    {
        public string FoodId { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
        public decimal TotalPrice { get; set; }
    }
}
