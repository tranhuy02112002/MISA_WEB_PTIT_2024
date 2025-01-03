using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using Web.Misaweb2024.Api.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class FoodDetailsController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        // Lấy danh sách tất cả món ăn
        [HttpGet]
        public IActionResult GetAllFoods()
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM food";
                    var foods = sqlConnection.Query<FoodDto>(sqlQuery).ToList();

                    if (foods.Count == 0)
                    {
                        return NoContent();
                    }

                    return Ok(foods);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }
        // Lấy thông tin món ăn theo ID
        [HttpGet("{id}")]
        public IActionResult GetFoodById(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    var sqlQuery = "SELECT * FROM food WHERE FoodID = @FoodID";
                    var food = sqlConnection.QuerySingleOrDefault<Food>(sqlQuery, new { FoodID = id });

                    if (food == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    // Lấy chi tiết món ăn cùng với tên nguyên liệu
                    var detailsQuery = @"
                    SELECT fd.*, i.IngredientName 
                    FROM fooddetail fd
                    JOIN ingredient i ON fd.IngredientId = i.IngredientId
                    WHERE fd.FoodId = @FoodId";
                    food.FoodDetails = sqlConnection.Query<FoodDetail>(detailsQuery, new { FoodId = id }).ToList();
                    return Ok(food);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Thêm món ăn mới
        [HttpPost]
        public IActionResult AddFood(FoodDto food)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    if (food == null || string.IsNullOrEmpty(food.FoodName) || food.FoodPrice <= 0 || string.IsNullOrEmpty(food.ImageUrl))
                    {
                        return BadRequest("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                    }

                    food.FoodID = Guid.NewGuid();

                    var sqlQuery = @"
                        INSERT INTO food (FoodID, FoodName, FoodPrice, ImageUrl)
                        VALUES (@FoodID, @FoodName, @FoodPrice, @ImageUrl)";

                    var result = sqlConnection.Execute(sqlQuery, new
                    {
                        food.FoodID,
                        food.FoodName,
                        food.FoodPrice,
                        food.ImageUrl
                    });

                    // Tạo bản ghi trong bảng fooddetail
                    if (food.FoodDetails != null)
                    {
                        foreach (var detail in food.FoodDetails)
                        {
                            detail.FooddetailId = Guid.NewGuid();
                            detail.FoodId = food.FoodID;

                            var detailQuery = @"
                                INSERT INTO fooddetail (FoodDetailId, FoodId, IngredientId, Quantity)
                                VALUES (@FoodDetailId, @FoodId, @IngredientId, @Quantity)";

                            sqlConnection.Execute(detailQuery, detail);
                        }
                    }

                    if (result > 0)
                    {
                        return Ok(food);
                    }

                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể thêm món ăn.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        // Xóa món ăn
        [HttpDelete("{id}")]
        public IActionResult DeleteFood(Guid id)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra xem món ăn có tồn tại không
                    var sqlQuery = "SELECT * FROM food WHERE FoodID = @FoodID";
                    var food = sqlConnection.QuerySingleOrDefault<FoodDto>(sqlQuery, new { FoodID = id });

                    if (food == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    // Xóa các chi tiết đặt hàng liên quan đến món ăn
                    var deleteOrderDetailQuery = "DELETE FROM fooddetail WHERE FoodID = @FoodID";
                    sqlConnection.Execute(deleteOrderDetailQuery, new { FoodID = id });

                    // Tiến hành xóa món ăn
                    var deleteQuery = "DELETE FROM food WHERE FoodID = @FoodID";
                    var result = sqlConnection.Execute(deleteQuery, new { FoodID = id });

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


        // Cập nhật thông tin món ăn
        [HttpPut("{id}")]
        public IActionResult UpdateFood(Guid id, FoodDto food)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    if (food == null || string.IsNullOrEmpty(food.FoodName) || food.FoodPrice <= 0 || string.IsNullOrEmpty(food.ImageUrl))
                    {
                        return BadRequest("Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.");
                    }

                    var sqlQuery = "SELECT * FROM food WHERE FoodID = @FoodID";
                    var existingFood = sqlConnection.QuerySingleOrDefault<FoodDto>(sqlQuery, new { FoodId = id });

                    if (existingFood == null)
                    {
                        return NotFound(new { message = "Món ăn không tồn tại." });
                    }

                    var updateQuery = @"
                    UPDATE food 
                    SET FoodName = @FoodName, FoodPrice = @FoodPrice, ImageUrl = @ImageUrl
                    WHERE FoodID = @FoodID";

                    var result = sqlConnection.Execute(updateQuery, new
                    {
                        FoodID = id,
                        food.FoodName,
                        food.FoodPrice,
                        food.ImageUrl
                    });

                    if (result > 0)
                    {
                        // Cập nhật fooddetail nếu có
                        if (food.FoodDetails != null)
                        {
                            // Xóa các chi tiết cũ trước khi thêm mới
                            var deleteDetailsQuery = "DELETE FROM fooddetail WHERE FoodID = @FoodID";
                            sqlConnection.Execute(deleteDetailsQuery, new { FoodID = id });

                            foreach (var detail in food.FoodDetails)
                            {
                                detail.FooddetailId= Guid.NewGuid();
                                detail.FoodId = id;

                                var detailQuery = @"
                                    INSERT INTO fooddetail (FoodDetailId, FoodId, IngredientId, Quantity)
                                    VALUES (@FoodDetailId, @FoodId, @IngredientId, @Quantity)";

                                sqlConnection.Execute(detailQuery, detail);
                            }
                        }

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
