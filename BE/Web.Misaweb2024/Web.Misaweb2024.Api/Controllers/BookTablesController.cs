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
    public class BooktablesController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Lấy danh sách tất cả đặt bàn
        [HttpGet]
        public IActionResult GetAllBooktables()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = @"
                        SELECT 
                            bt.BooktableId, 
                            bt.CustomerName, 
                            bt.CustomerPhone, 
                            bt.CustomerEmail, 
                            bt.Bookdate, 
                            bt.GuestCount, 
                            bt.Status,
                            t.TableNumber
                        FROM booktable bt
                        JOIN `table` t ON bt.TableId = t.TableId";

                    var booktables = sqlConnection.Query<BooktableDto>(sqlQuery).ToList();

                    if (booktables.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(booktables);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Lấy danh sách bàn trống
        [HttpGet("available")]
        public IActionResult GetAvailableTables()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = @"
                        SELECT t.TableId, t.TableNumber, t.Seats
                        FROM `table` t";

                    var availableTables = sqlConnection.Query<TableDto>(sqlQuery).ToList();

                    if (availableTables.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(availableTables);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Thêm đặt bàn mới
        [HttpPost]
        public IActionResult AddBooktable([FromBody] Booktable booktable)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Validate input
                    if (booktable == null ||
                        string.IsNullOrEmpty(booktable.CustomerName) ||
                        string.IsNullOrEmpty(booktable.CustomerPhone))
                    {
                        return BadRequest("Dữ liệu không hợp lệ.");
                    }

                    // Kiểm tra bàn đã được đặt chưa
                    var checkTableQuery = @"
                    SELECT COUNT(*) 
                    FROM booktable 
                    WHERE TableId = @TableId 
                    AND Status = 1 
                    AND @Bookdate BETWEEN DATE_SUB(Bookdate, INTERVAL 5 HOUR) 
                                      AND DATE_ADD(Bookdate, INTERVAL 5 HOUR)
                     ";


                    var isTableBooked = sqlConnection.ExecuteScalar<bool>(checkTableQuery, new
                    {
                        TableId = booktable.TableId,
                        Bookdate = booktable.Bookdate
                    });

                    if (isTableBooked)
                    {
                        return BadRequest("Bàn đã được đặt trong thời gian này.");
                    }

                    // Thêm đặt bàn mới
                    var sqlQuery = @"
                        INSERT INTO booktable 
                        (BooktableId, CustomerName, CustomerPhone, CustomerEmail, Bookdate, GuestCount, TableId, Status) 
                        VALUES 
                        (@BooktableId, @CustomerName, @CustomerPhone, @CustomerEmail, @Bookdate, @GuestCount, @TableId, @Status)";

                    booktable.BooktableId = Guid.NewGuid();
                    booktable.Status = 1; // Chưa duyệt

                    sqlConnection.Execute(sqlQuery, booktable);

                    return CreatedAtAction(nameof(GetAllBooktables), new { id = booktable.BooktableId }, booktable);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public IActionResult GetBooktableById(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = @"
                SELECT 
                    bt.BooktableId, 
                    bt.CustomerName, 
                    bt.CustomerPhone, 
                    bt.CustomerEmail, 
                    bt.Bookdate, 
                    bt.GuestCount, 
                    bt.Status,
                    bt.TableId,
                    t.TableNumber
                FROM booktable bt
                JOIN `table` t ON bt.TableId = t.TableId
                WHERE bt.BooktableId = @BooktableId";

                    var booktable = sqlConnection.QueryFirstOrDefault<BooktableDto>(sqlQuery, new { BooktableId = id });

                    if (booktable == null)
                    {
                        return NotFound();
                    }

                    return Ok(booktable);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public IActionResult UpdateBooktable(Guid id, [FromBody] Booktable booktable)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Validate input
                    if (booktable == null || id == Guid.Empty)
                    {
                        return BadRequest("Dữ liệu không hợp lệ.");
                    }

                    // Kiểm tra bàn đã được đặt chưa
                    var checkTableQuery = @"
                SELECT COUNT(*) 
                FROM booktable 
                WHERE TableId = @TableId 
                AND BooktableId != @BooktableId
                AND Status = 1 
                AND @Bookdate BETWEEN DATE_SUB(Bookdate, INTERVAL 5 HOUR) 
                                  AND DATE_ADD(Bookdate, INTERVAL 5 HOUR)
            ";

                    var isTableBooked = sqlConnection.ExecuteScalar<bool>(checkTableQuery, new
                    {
                        TableId = booktable.TableId,
                        Bookdate = booktable.Bookdate,
                        BooktableId = id
                    });

                    if (isTableBooked)
                    {
                        return BadRequest("Bàn đã được đặt trong thời gian này.");
                    }

                    // Cập nhật đặt bàn
                    var sqlQuery = @"
                UPDATE booktable 
                SET 
                    CustomerName = @CustomerName, 
                    CustomerPhone = @CustomerPhone, 
                    CustomerEmail = @CustomerEmail, 
                    Bookdate = @Bookdate, 
                    GuestCount = @GuestCount, 
                    TableId = @TableId 
                WHERE BooktableId = @BooktableId";

                    booktable.BooktableId = id;
                    int rowsAffected = sqlConnection.Execute(sqlQuery, booktable);

                    if (rowsAffected == 0)
                    {
                        return NotFound();
                    }

                    return Ok(booktable);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public IActionResult DeleteBooktable(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "DELETE FROM booktable WHERE BooktableId = @BooktableId";

                    int rowsAffected = sqlConnection.Execute(sqlQuery, new { BooktableId = id });

                    if (rowsAffected == 0)
                    {
                        return NotFound();
                    }

                    return Ok(new { message = "Xóa đặt bàn thành công" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        [HttpPatch("{id}/approve")]
        public IActionResult ApproveBooktable(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = @"
                UPDATE booktable 
                SET Status = 1 
                WHERE BooktableId = @BooktableId";

                    int rowsAffected = sqlConnection.Execute(sqlQuery, new { BooktableId = id });

                    if (rowsAffected == 0)
                    {
                        return NotFound();
                    }

                    return Ok(new { message = "Duyệt đặt bàn thành công" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }


        // Mô hình DTO để trả về
        [HttpPost("create")]
        public IActionResult CreateBooktable([FromBody] BooktableCreateDto bookTableDto)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Validate input
                    if (bookTableDto == null ||
                        string.IsNullOrEmpty(bookTableDto.CustomerName) ||
                        string.IsNullOrEmpty(bookTableDto.CustomerPhone))
                    {
                        return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                    }

                    // Kiểm tra ngày đặt bàn
                    if (bookTableDto.BookDate <= DateTime.Now)
                    {
                        return BadRequest(new { message = "Ngày đặt bàn không hợp lệ" });
                    }

                    // Kiểm tra số lượng khách
                    if (bookTableDto.GuestCount <= 0 || bookTableDto.GuestCount > 20)
                    {
                        return BadRequest(new { message = "Số lượng khách không hợp lệ" });
                    }

                    // Tìm bàn phù hợp
                    var findTableQuery = @"
                    SELECT TableId, TableNumber 
                    FROM `table` 
                    WHERE Seats >= @GuestCount 
                    AND TableId NOT IN (
                        SELECT TableId 
                        FROM booktable 
                        WHERE Status = 1 
                        AND @BookDate BETWEEN DATE_SUB(Bookdate, INTERVAL 5 HOUR) 
                        AND DATE_ADD(Bookdate, INTERVAL 5 HOUR)
                    )
                    LIMIT 1";

                    var availableTable = sqlConnection.QueryFirstOrDefault(findTableQuery, new
                    {
                        GuestCount = bookTableDto.GuestCount,
                        BookDate = bookTableDto.BookDate
                    });

                    if (availableTable == null)
                    {
                        return BadRequest(new { message = "Không có bàn phù hợp" });
                    }

                    // Thêm đặt bàn mới
                    var insertQuery = @"
                    INSERT INTO booktable 
                    (BooktableId, CustomerId, CustomerName, CustomerPhone, 
                    CustomerEmail, Bookdate, GuestCount, TableId, Status) 
                    VALUES 
                    (@BooktableId, @CustomerId, @CustomerName, @CustomerPhone, 
                    @CustomerEmail, @BookDate, @GuestCount, @TableId, 0)";

                    var booktable = new Booktable1
                    {
                        BooktableId = Guid.NewGuid(),
                        CustomerId = bookTableDto.CustomerId,
                        CustomerName = bookTableDto.CustomerName,
                        CustomerPhone = bookTableDto.CustomerPhone,
                        CustomerEmail = bookTableDto.CustomerEmail,
                        Bookdate = bookTableDto.BookDate,
                        GuestCount = bookTableDto.GuestCount,
                        TableId = availableTable.TableId,
                        Status = 0 // Chưa duyệt
                    };

                    sqlConnection.Execute(insertQuery, booktable);

                    // Trả về thông tin đặt bàn
                    return CreatedAtAction(nameof(GetBooktableById),
                        new { id = booktable.BooktableId },
                        new
                        {
                            BooktableId = booktable.BooktableId,
                            TableNumber = availableTable.TableNumber,
                            Message = "Đặt bàn thành công"
                        });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpPut("update/{id}")]
        public IActionResult UpdateBooktable(Guid id, [FromBody] BooktableUpdateDto bookTableDto)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra tồn tại đơn đặt bàn
                    var existingBooktableQuery = @"
                SELECT * FROM booktable 
                WHERE BooktableId = @BooktableId AND Status = 0";

                    var existingBooktable = sqlConnection.QueryFirstOrDefault<Booktable>(
                        existingBooktableQuery,
                        new { BooktableId = id }
                    );

                    if (existingBooktable == null)
                    {
                        return NotFound(new { message = "Không tìm thấy đơn đặt bàn" });
                    }

                    // Validate input
                    if (string.IsNullOrEmpty(bookTableDto.CustomerName) ||
                        string.IsNullOrEmpty(bookTableDto.CustomerPhone))
                    {
                        return BadRequest(new { message = "Dữ liệu không hợp lệ" });
                    }

                    // Kiểm tra ngày đặt bàn
                    if (bookTableDto.BookDate <= DateTime.Now)
                    {
                        return BadRequest(new { message = "Ngày đặt bàn không hợp lệ" });
                    }

                    // Kiểm tra số lượng khách
                    if (bookTableDto.GuestCount <= 0 || bookTableDto.GuestCount > 20)
                    {
                        return BadRequest(new { message = "Số lượng khách không hợp lệ" });
                    }

                    // Tìm bàn phù hợp
                    var findTableQuery = @"
                SELECT TableId, TableNumber 
                FROM `table` 
                WHERE Seats >= @GuestCount 
                AND TableId NOT IN (
                    SELECT TableId 
                    FROM booktable 
                    WHERE Status = 1 
                    AND BooktableId != @CurrentBooktableId
                    AND @BookDate BETWEEN DATE_SUB(Bookdate, INTERVAL 5 HOUR) 
                    AND DATE_ADD(Bookdate, INTERVAL 5 HOUR)
                )
                LIMIT 1";

                    var availableTable = sqlConnection.QueryFirstOrDefault(findTableQuery, new
                    {
                        GuestCount = bookTableDto.GuestCount,
                        BookDate = bookTableDto.BookDate,
                        CurrentBooktableId = id
                    });

                    if (availableTable == null)
                    {
                        return BadRequest(new { message = "Không có bàn phù hợp" });
                    }

                    // Cập nhật đặt bàn
                    var updateQuery = @"
                UPDATE booktable 
                SET CustomerName = @CustomerName, 
                    CustomerPhone = @CustomerPhone, 
                    CustomerEmail = @CustomerEmail, 
                    Bookdate = @BookDate, 
                    GuestCount = @GuestCount, 
                    TableId = @TableId
                WHERE BooktableId = @BooktableId";

                    var updatedBooktable = new Booktable
                    {
                        BooktableId = id,
                        CustomerName = bookTableDto.CustomerName,
                        CustomerPhone = bookTableDto.CustomerPhone,
                        CustomerEmail = bookTableDto.CustomerEmail,
                        Bookdate = bookTableDto.BookDate,
                        GuestCount = bookTableDto.GuestCount,
                        TableId = availableTable.TableId
                    };

                    sqlConnection.Execute(updateQuery, updatedBooktable);

                    return Ok(new
                    {
                        BooktableId = id,
                        TableNumber = availableTable.TableNumber,
                        Message = "Cập nhật đặt bàn thành công"
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = $"Lỗi: {ex.Message}" });
            }
        }

        [HttpGet("customer/{customerId}")]
        public IActionResult GetBooktablesByCustomerId(Guid customerId)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = @"
                SELECT 
                    bt.BooktableId, 
                    bt.CustomerName, 
                    bt.CustomerPhone, 
                    bt.CustomerEmail, 
                    bt.Bookdate, 
                    bt.GuestCount, 
                    bt.Status,
                    t.TableNumber
                FROM booktable bt
                LEFT JOIN `table` t ON bt.TableId = t.TableId
                WHERE bt.CustomerId = @CustomerId
                ORDER BY bt.Bookdate DESC";

                    var booktables = sqlConnection.Query<BooktableDto>(sqlQuery, new { CustomerId = customerId }).ToList();

                    if (booktables.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(booktables);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        [HttpPut("cancel/{id}")]
        public IActionResult CancelBooktable(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra trạng thái hiện tại của đơn đặt bàn
                    var checkStatusQuery = @"
                SELECT Status, CustomerId 
                FROM booktable 
                WHERE BooktableId = @BooktableId";

                    var bookingInfo = sqlConnection.QueryFirstOrDefault(
                        checkStatusQuery,
                        new { BooktableId = id }
                    );

                    if (bookingInfo == null)
                    {
                        return NotFound(new { message = "Không tìm thấy đơn đặt bàn" });
                    }

                    if (bookingInfo.Status == 1)
                    {
                        return BadRequest(new { message = "Không thể hủy đơn đã được duyệt" });
                    }

                    var sqlQuery = @"
                UPDATE booktable 
                SET Status = 2  -- Trạng thái hủy
                WHERE BooktableId = @BooktableId";

                    int rowsAffected = sqlConnection.Execute(sqlQuery, new { BooktableId = id });

                    if (rowsAffected == 0)
                    {
                        return NotFound(new { message = "Không thể hủy đơn đặt bàn" });
                    }

                    return Ok(new { message = "Hủy đặt bàn thành công" });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError,
                    new { message = $"Lỗi: {ex.Message}" });
            }
        }

        // Các DTO để validate và ánh xạ dữ liệu
        public class BooktableCreateDto
        {
            public Guid CustomerId { get; set; }
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public DateTime BookDate { get; set; }
            public int GuestCount { get; set; }
        }

        public class BooktableUpdateDto
        {
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public DateTime BookDate { get; set; }
            public int GuestCount { get; set; }
        }
        public class Booktable1
        {
            public Guid BooktableId { get; set; }
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public DateTime Bookdate { get; set; }
            public int GuestCount { get; set; }
            public Guid TableId { get; set; }
            public Guid CustomerId { get; set; }

            public int Status { get; set; }

        }

        public class BooktableDto
        {
            public Guid BooktableId { get; set; }
            public string CustomerName { get; set; }
            public string CustomerPhone { get; set; }
            public string CustomerEmail { get; set; }
            public DateTime Bookdate { get; set; }
            public int GuestCount { get; set; }
            public int Status { get; set; }
            public string TableNumber { get; set; }
        }

        public class TableDto
        {
            public Guid TableId { get; set; }
            public string TableNumber { get; set; }
            public int Seats { get; set; }
        }
    }
}
