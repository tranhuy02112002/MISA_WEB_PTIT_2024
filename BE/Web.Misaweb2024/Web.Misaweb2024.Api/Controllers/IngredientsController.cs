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
    public class IngredientsController : ControllerBase
    {
        // Chuỗi kết nối đến cơ sở dữ liệu
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        /// <summary>
        /// Lấy danh sách tất cả nguyên liệu
        /// </summary>
        [HttpGet]
        public IActionResult GetAllIngredients()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM ingredient";
                    var ingredients = sqlConnection.Query<Ingredient>(sqlQuery)
                        .Select(i => {
                            // Nếu ngày hết hạn nhỏ hơn hoặc bằng ngày hiện tại
                            if (i.IngredientExpired <= DateTime.Now)
                            {
                                i.IngredientStatus = "Hết Hạn";

                                // Cập nhật trạng thái trong database
                                UpdateIngredientStatus(sqlConnection, i.IngredientId, "Hết Hạn");
                            }
                            return i;
                        })
                        .ToList();

                    return ingredients.Count == 0 ? NoContent() : Ok(ingredients);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Thêm nguyên liệu mới
        /// </summary>
        [HttpPost]
        public IActionResult AddIngredient(Ingredient ingredient)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra dữ liệu đầu vào
                    if (ingredient == null || string.IsNullOrEmpty(ingredient.IngredientName))
                    {
                        return BadRequest("Dữ liệu không hợp lệ");
                    }

                    // Tự động sinh ID và trạng thái
                    ingredient.IngredientId = Guid.NewGuid();
                    ingredient.IngredientStatus = DetermineIngredientStatus(ingredient.IngredientExpired);

                    var sqlQuery = @"
                        INSERT INTO ingredient
                        (IngredientId, IngredientName, IngredientQuantity, IngredientUnit, 
                        IngredientExpired, IngredientType, IngredientStatus)
                        VALUES 
                        (@IngredientId, @IngredientName, @IngredientQuantity, @IngredientUnit, 
                        @IngredientExpired, @IngredientType, @IngredientStatus)";

                    var result = sqlConnection.Execute(sqlQuery, ingredient);

                    if (result > 0)
                    {
                        return Ok(ingredient);
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể thêm nguyên liệu");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy chi tiết nguyên liệu theo ID
        /// </summary>
        [HttpGet("{id}")]
        public IActionResult GetIngredientById(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM ingredient WHERE IngredientId = @Id";
                    var ingredient = sqlConnection.QuerySingleOrDefault<Ingredient>(sqlQuery, new { Id = id });

                    if (ingredient == null)
                    {
                        return NotFound("Nguyên liệu không tồn tại");
                    }

                    return Ok(ingredient);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Cập nhật nguyên liệu
        /// </summary>
        [HttpPut("{id}")]
        public IActionResult UpdateIngredient(Guid id, Ingredient ingredient)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra nguyên liệu tồn tại
                    var checkQuery = "SELECT * FROM ingredient WHERE IngredientId = @Id";
                    var existingIngredient = sqlConnection.QuerySingleOrDefault<Ingredient>(checkQuery, new { Id = id });

                    if (existingIngredient == null)
                    {
                        return NotFound("Nguyên liệu không tồn tại");
                    }

                    // Cập nhật trạng thái
                    ingredient.IngredientStatus = DetermineIngredientStatus(ingredient.IngredientExpired);
                    var sqlQuery = @"
                        UPDATE ingredient 
                        SET IngredientName = @IngredientName, 
                            IngredientQuantity = @IngredientQuantity, 
                            IngredientUnit = @IngredientUnit,
                            IngredientExpired = @IngredientExpired, 
                            IngredientType = @IngredientType,
                            IngredientStatus = @IngredientStatus
                        WHERE IngredientId = @IngredientId";

                    var result = sqlConnection.Execute(sqlQuery, ingredient);

                    if (result > 0)
                    {
                        return Ok(ingredient);
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể cập nhật nguyên liệu");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa nguyên liệu
        /// </summary>
        [HttpDelete("{id}")]
        public IActionResult DeleteIngredient(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var checkQuery = "SELECT * FROM ingredient WHERE IngredientId = @Id";
                    var ingredient = sqlConnection.QuerySingleOrDefault<Ingredient>(checkQuery, new { Id = id });

                    if (ingredient == null)
                    {
                        return NotFound("Nguyên liệu không tồn tại");
                    }

                    var deleteQuery = "DELETE FROM ingredient WHERE IngredientId = @Id";
                    var result = sqlConnection.Execute(deleteQuery, new { Id = id });

                    if (result > 0)
                    {
                        return Ok(new { message = "Nguyên liệu đã được xóa thành công" });
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể xóa nguyên liệu");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }
        /// <summary>
        /// Tìm kiếm nguyên liệu theo tên hoặc loại
        /// </summary>
        [HttpGet("search")]
        public IActionResult SearchIngredients([FromQuery] string keyword, [FromQuery] string type)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM ingredient WHERE 1=1";
                    var parameters = new DynamicParameters();

                    if (!string.IsNullOrEmpty(keyword))
                    {
                        sqlQuery += " AND (IngredientName LIKE @Keyword OR IngredientType LIKE @Keyword)";
                        parameters.Add("@Keyword", $"%{keyword}%");
                    }

                    if (!string.IsNullOrEmpty(type))
                    {
                        sqlQuery += " AND IngredientType = @Type";
                        parameters.Add("@Type", type);
                    }

                    var ingredients = sqlConnection.Query<Ingredient>(sqlQuery, parameters).ToList();

                    if (ingredients.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(ingredients);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

            /// <summary>
            /// Xác định trạng thái nguyên liệu
            /// </summary>
        private string DetermineIngredientStatus(DateTime? expiryDate)
        {
            if (!expiryDate.HasValue)
                return "Chưa Xác Định";

            return expiryDate.Value < DateTime.Now ? "Hết Hạn" : "Còn Hạn";
        }
        private void UpdateIngredientStatus(MySqlConnection connection, Guid ingredientId, string status)
        {
            try
            {
                var updateQuery = @"
            UPDATE ingredient 
            SET IngredientStatus = @Status 
            WHERE IngredientId = @Id";

                connection.Execute(updateQuery, new { Status = status, Id = ingredientId });
            }
            catch (Exception ex)
            {
                // Log lỗi hoặc xử lý tùy theo yêu cầu
                Console.WriteLine($"Lỗi cập nhật trạng thái: {ex.Message}");
            }
        }
    }
}
