using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using System;
using System.Linq;
using Web.Misaweb2024.Api.Model;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class CommentController : ControllerBase
    {
        // Connection string trực tiếp trong controller
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Lấy danh sách comment
        [HttpGet]
        public IActionResult GetComments()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM comment ORDER BY CreatedAt DESC LIMIT 10";
                    var comments = sqlConnection.Query<Comment>(sqlQuery).ToList();

                    if (comments.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(comments);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi: {ex.Message}");
            }
        }

        // Thêm comment mới
        [HttpPost]
        public IActionResult AddComment([FromBody] Comment comment)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Validate dữ liệu
                    if (comment == null || string.IsNullOrEmpty(comment.Content))
                    {
                        return BadRequest("Nội dung comment không được để trống");
                    }

                    // Tạo ID mới và set thời gian
                    comment.CommentId = Guid.NewGuid();
                    comment.CreatedAt = DateTime.Now;

                    // Câu truy vấn thêm comment
                    var sqlQuery = @"
                        INSERT INTO comment 
                        (CommentId, Content, CustomerName, CreatedAt) 
                        VALUES (@CommentId, @Content, @CustomerName, @CreatedAt)";

                    sqlConnection.Execute(sqlQuery, comment);

                    return CreatedAtAction(nameof(GetComments), new { id = comment.CommentId }, comment);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Lỗi: {ex.Message}");
            }
        }
    }
}
