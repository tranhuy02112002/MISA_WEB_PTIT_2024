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
    public class FoodsController : ControllerBase
    {
        // Chuỗi kết nối đến cơ sở dữ liệu
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        /// <summary>
        /// Lấy danh sách tất cả món ăn
        /// </summary>
        /// <returns>
        /// 200 - Danh sách món ăn
        /// 204 - Không có dữ liệu
        /// </returns>
        [HttpGet]
        public IActionResult GetAllFoods()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Truy vấn để lấy tất cả món ăn
                    var sqlQuery = "SELECT * FROM food";

                    var foods = sqlConnection.Query<Food>(sqlQuery).ToList();

                    if (foods.Count == 0)
                    {
                        return NoContent(); // 204 nếu không có dữ liệu
                    }

                    return Ok(foods); // Trả về danh sách món ăn
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Thêm món ăn mới
        /// </summary>
        /// <param name="food">Thông tin món ăn</param>
        /// <returns>Trả về món ăn đã thêm</returns>
        [HttpPost]
        public IActionResult AddFood(Food food)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra dữ liệu đầu vào
                    if (food == null || string.IsNullOrEmpty(food.FoodName) || food.FoodPrice <= 0 || string.IsNullOrEmpty(food.ImageUrl))
                    {
                        return BadRequest("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                    }

                    // Truy vấn thêm món ăn
                    var sqlQuery = @"
                        INSERT INTO food (FoodId, FoodName, FoodPrice, ImageUrl)
                        VALUES (@FoodID, @FoodName, @FoodPrice, @ImageUrl)";
                    food.FoodID = Guid.NewGuid(); // Sử dụng Guid cho ID món ăn

                    var result = sqlConnection.Execute(sqlQuery, new
                    {
                        food.FoodID,
                        food.FoodName,
                        food.FoodPrice,
                        food.ImageUrl
                    });

                    if (result > 0)
                    {
                        return Ok(food); // Trả về món ăn vừa thêm
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể thêm món ăn.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Xóa món ăn
        /// </summary>
        /// <param name="id">ID của món ăn cần xóa</param>
        /// <returns>Trả về kết quả xóa món ăn</returns>
        [HttpDelete("{id}")]
        public IActionResult DeleteFood(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Truy vấn để kiểm tra món ăn có tồn tại hay không
                    var sqlQuery = "SELECT * FROM food WHERE FoodId = @FoodId";
                    var food = sqlConnection.QuerySingleOrDefault<Food>(sqlQuery, new { FoodId = id });

                    if (food == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    // Truy vấn xóa món ăn
                    var deleteQuery = "DELETE FROM food WHERE FoodId = @FoodId";
                    var result = sqlConnection.Execute(deleteQuery, new { FoodId = id });

                    if (result > 0)
                    {
                        return Ok(new { message = "Món ăn đã được xóa thành công." });
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể xóa món ăn.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Lấy thông tin món ăn theo ID
        /// </summary>
        /// <param name="id">ID của món ăn</param>
        /// <returns>Trả về món ăn hoặc lỗi nếu không tìm thấy</returns>
        [HttpGet("{id}")]
        public IActionResult GetFoodById(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Truy vấn lấy món ăn theo ID
                    var sqlQuery = "SELECT * FROM food WHERE FoodId = @FoodId";
                    var food = sqlConnection.QuerySingleOrDefault<Food>(sqlQuery, new { FoodId = id });

                    if (food == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    return Ok(food); // Trả về món ăn tìm được
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// Cập nhật thông tin món ăn
        /// </summary>
        /// <param name="id">ID của món ăn cần cập nhật</param>
        /// <param name="food">Thông tin món ăn mới</param>
        /// <returns>Trả về món ăn đã cập nhật hoặc lỗi nếu không thành công</returns>
        [HttpPut("{id}")]
        public IActionResult UpdateFood(Guid id, Food food)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra dữ liệu đầu vào
                    if (food == null || string.IsNullOrEmpty(food.FoodName) || food.FoodPrice <= 0 || string.IsNullOrEmpty(food.ImageUrl))
                    {
                        return BadRequest("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                    }

                    // Truy vấn để kiểm tra món ăn có tồn tại không
                    var sqlQuery = "SELECT * FROM food WHERE FoodId = @FoodId";
                    var existingFood = sqlConnection.QuerySingleOrDefault<Food>(sqlQuery, new { FoodId = id });

                    if (existingFood == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    // Truy vấn cập nhật món ăn
                    var updateQuery = @"
                UPDATE food 
                SET FoodName = @FoodName, FoodPrice = @FoodPrice, ImageUrl = @ImageUrl
                WHERE FoodId = @FoodId";

                    var result = sqlConnection.Execute(updateQuery, new
                    {
                        FoodId = id,
                        food.FoodName,
                        food.FoodPrice,
                        food.ImageUrl
                    });

                    if (result > 0)
                    {
                        return Ok(new { message = "Món ăn đã được cập nhật thành công." });
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể cập nhật món ăn.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

    }
}
