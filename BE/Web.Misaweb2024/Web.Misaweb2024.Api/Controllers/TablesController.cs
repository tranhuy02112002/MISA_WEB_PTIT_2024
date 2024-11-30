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
    public class TablesController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Lấy danh sách tất cả bàn ăn
        [HttpGet]
        public IActionResult GetAllTables()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM `table`"; // Bao quanh tên bảng bằng dấu nháy ngược
                    var tables = sqlConnection.Query<Table>(sqlQuery).ToList();

                    if (tables.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(tables);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Thêm bàn ăn mới
        [HttpPost]
        public IActionResult AddTable(Table table)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    if (table == null || string.IsNullOrEmpty(table.TableNumber.ToString()))
                    {
                        return BadRequest("Dữ liệu không hợp lệ.");
                    }

                    var sqlQuery = "INSERT INTO `table` (TableId, TableNumber, Status, Seats) VALUES (@TableId, @TableNumber, @Status, @Seats)"; // Bao quanh tên bảng bằng dấu nháy ngược
                    table.TableId = Guid.NewGuid();  // Tạo ID ngẫu nhiên
                    sqlConnection.Execute(sqlQuery, table);

                    return CreatedAtAction(nameof(GetAllTables), new { id = table.TableId }, table);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }
        // Lấy thông tin của bàn ăn theo TableId
        [HttpGet("{id}")]
        public IActionResult GetTableById(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM `table` WHERE TableId = @TableId"; // Bao quanh tên bảng bằng dấu nháy ngược
                    var table = sqlConnection.QuerySingleOrDefault<Table>(sqlQuery, new { TableId = id });

                    if (table == null)
                    {
                        return NotFound($"Không tìm thấy bàn ăn với ID = {id}");
                    }

                    return Ok(table);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }


        // Cập nhật bàn ăn
        [HttpPut("{id}")]
        public IActionResult UpdateTable(Guid id, Table table)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    if (table == null || table.TableId != id)
                    {
                        return BadRequest("Dữ liệu không hợp lệ.");
                    }

                    var sqlQuery = "UPDATE `table` SET TableNumber = @TableNumber, Status = @Status, Seats = @Seats WHERE TableId = @TableId"; // Bao quanh tên bảng bằng dấu nháy ngược
                    sqlConnection.Execute(sqlQuery, table);

                    return Ok(table);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Xóa bàn ăn
        [HttpDelete("{id}")]
        public IActionResult DeleteTable(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "DELETE FROM `table` WHERE TableId = @TableId"; // Bao quanh tên bảng bằng dấu nháy ngược
                    var rowsAffected = sqlConnection.Execute(sqlQuery, new { TableId = id });

                    if (rowsAffected == 0)
                    {
                        return NotFound($"Không tìm thấy bàn ăn có ID = {id}");
                    }

                    return NoContent();  // Trả về mã trạng thái 204 (Không có nội dung) khi xóa thành công
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }
    }
}
