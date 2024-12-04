using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using Web.Misaweb2024.Api.Model;
using System;
using System.Linq;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Tạo đơn hàng mới
        [HttpPost]
        public IActionResult CreateOrder([FromBody] OrderCreateDto orderDto)
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
                            INSERT INTO `order` 
                            (OrderID, TableID, CustomerName, CustomerPhone, CustomerEmail, 
                            DiscountPercentage, TotalAmount, Status, CreatedDate)
                            VALUES 
                            (@OrderID, @TableID, @CustomerName, @CustomerPhone, @CustomerEmail, 
                            @DiscountPercentage, @TotalAmount, @Status, @CreatedDate)";

                        sqlConnection.Execute(insertOrderQuery, new
                        {
                            OrderID = orderId,
                            orderDto.TableID,
                            orderDto.CustomerName,
                            orderDto.CustomerPhone,
                            orderDto.CustomerEmail,
                            orderDto.DiscountPercentage,
                            orderDto.TotalAmount,
                            Status = "Đang xử lý",
                            CreatedDate = DateTime.Now
                        }, transaction);

                        var orderdetailId = Guid.NewGuid();
                        var insertOrderDetailQuery = @"
                            INSERT INTO orderdetails 
                            (OrderDetailID, OrderID, FoodID, Quantity, Price, TotalPrice)
                            VALUES 
                            (UUID(), @OrderID, @FoodID, @Quantity, @Price, @TotalPrice)";

                        foreach (var detail in orderDto.OrderDetails)
                        {
                            sqlConnection.Execute(insertOrderDetailQuery, new
                            {
                                OrderDetailID = orderdetailId,
                                OrderID = orderId,
                                detail.FoodID,
                                detail.Quantity,
                                detail.Price,
                                TotalPrice = detail.Quantity * detail.Price
                            }, transaction);
                        }

                        var updateTableStatusQuery = @"
                            UPDATE `table` 
                            SET Status = 'unavailable' 
                            WHERE TableID = @TableID";

                        sqlConnection.Execute(updateTableStatusQuery, new { orderDto.TableID }, transaction);

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
        //Cập nhật đơn hàng
        [HttpPut("update/{orderId}")]
        public IActionResult UpdateOrder(Guid orderId, [FromBody] OrderCreateDto orderDto)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    sqlConnection.Open();
                    using var transaction = sqlConnection.BeginTransaction();

                    try
                    {
                        // Update thông tin order
                        var updateOrderQuery = @"
                    UPDATE `order`
                    SET CustomerName = @CustomerName,
                        CustomerPhone = @CustomerPhone,
                        CustomerEmail = @CustomerEmail,
                        DiscountPercentage = @DiscountPercentage,
                        TotalAmount = @TotalAmount
                    WHERE OrderID = @OrderID";

                        sqlConnection.Execute(updateOrderQuery, new
                        {
                            OrderID = orderId,
                            orderDto.CustomerName,
                            orderDto.CustomerPhone,
                            orderDto.CustomerEmail,
                            orderDto.DiscountPercentage,
                            orderDto.TotalAmount
                        }, transaction);

                        // Xóa các chi tiết order cũ
                        var deleteOrderDetailsQuery = @"
                    DELETE FROM orderdetails 
                    WHERE OrderID = @OrderID";

                        sqlConnection.Execute(deleteOrderDetailsQuery, new { OrderID = orderId }, transaction);

                        // Thêm lại các chi tiết order mới
                        var insertOrderDetailQuery = @"
                    INSERT INTO orderdetails 
                    (OrderDetailID, OrderID, FoodID, Quantity, Price, TotalPrice)
                    VALUES 
                    (UUID(), @OrderID, @FoodID, @Quantity, @Price, @TotalPrice)";

                        foreach (var detail in orderDto.OrderDetails)
                        {
                            sqlConnection.Execute(insertOrderDetailQuery, new
                            {
                                OrderID = orderId,
                                detail.FoodID,
                                detail.Quantity,
                                detail.Price,
                                TotalPrice = detail.Quantity * detail.Price
                            }, transaction);
                        }

                        transaction.Commit();

                        return Ok(new { Message = "Cập nhật đơn hàng thành công" });
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


        // Lấy đơn hàng theo ID bàn
        [HttpGet("table/{tableId}")]
        public IActionResult GetOrderByTableId(Guid tableId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var getOrderQuery = @"
                        SELECT o.*, 
                        JSON_ARRAYAGG(
                            JSON_OBJECT(
                                'FoodID', od.FoodID, 
                                'FoodName', f.FoodName, 
                                'Quantity', od.Quantity, 
                                'Price', od.Price
                            )
                        ) AS OrderDetails
                        FROM `order`  o
                        LEFT JOIN orderdetails od ON o.OrderID = od.OrderID
                        LEFT JOIN food f ON od.FoodID = f.FoodID
                        WHERE o.TableID = @TableID 
                        AND o.Status = 'Đang xử lý'
                        GROUP BY o.OrderID";

                    var order = sqlConnection.QueryFirstOrDefault<dynamic>(getOrderQuery, new { TableID = tableId });

                    if (order == null)
                    {
                        return NotFound("Không tìm thấy đơn hàng.");
                    }

                    return Ok(order);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi hệ thống: {ex.Message}");
            }
        }

        // Thanh toán đơn hàng
        [HttpPost("payment/{tableId}")]
        public IActionResult ProcessPayment(Guid tableId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    sqlConnection.Open();
                    using var transaction = sqlConnection.BeginTransaction();

                    try
                    {
                        var getOrderQuery = @"
                    SELECT OrderID, TotalAmount, CustomerName, CustomerPhone
                    FROM `order`
                    WHERE TableID = @TableID AND Status = 'Đang xử lý' 
                    LIMIT 1";

                        var order = sqlConnection.QueryFirstOrDefault<dynamic>(getOrderQuery, new { TableID = tableId }, transaction);

                        if (order == null)
                        {
                            return NotFound("Không tìm thấy đơn hàng để thanh toán.");
                        }

                        var updateOrderQuery = @"
                    UPDATE `order`
                    SET Status = 'Đã thanh toán', 
                        PaymentDate = @PaymentDate
                    WHERE OrderID = @OrderID";

                        sqlConnection.Execute(updateOrderQuery, new
                        {
                            OrderID = order.OrderID,
                            PaymentDate = DateTime.Now
                        }, transaction);

                        var insertPaymentQuery = @"
                     INSERT INTO payment
                     (PaymentID, OrderID, PaymentAmount, PaymentDate, PaymentStatus, CustomerName, CustomerPhone)
                     VALUES 
                     (UUID(), @OrderID, @PaymentAmount, @PaymentDate, 'Thành công', @CustomerName, @CustomerPhone)";

                        sqlConnection.Execute(insertPaymentQuery, new
                        {
                            PaymentID = Guid.NewGuid(),
                            OrderID = order.OrderID,
                            PaymentAmount = order.TotalAmount,
                            PaymentDate = DateTime.Now,
                            CustomerName = order.CustomerName,
                            CustomerPhone = order.CustomerPhone
                        }, transaction);

                        var updateTableStatusQuery = @"
                    UPDATE `table` 
                    SET Status = 'Available' 
                    WHERE TableID = @TableID";

                        sqlConnection.Execute(updateTableStatusQuery, new { TableID = tableId }, transaction);

                        transaction.Commit();

                        return Ok(new
                        {
                            Message = "Thanh toán thành công",
                            OrderID = order.OrderID,
                            TotalAmount = order.TotalAmount
                        });
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
    }
}
