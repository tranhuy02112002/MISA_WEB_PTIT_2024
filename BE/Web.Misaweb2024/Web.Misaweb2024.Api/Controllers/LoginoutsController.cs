using Microsoft.AspNetCore.Mvc;
using MySqlConnector;
using Dapper;
using System;
using Web.Misaweb2024.Api.Model;
using Microsoft.AspNetCore.Identity;
using System.Data;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
    [ApiController]
    public class LoginoutsController : ControllerBase
    {
        private readonly string _connectionString = "Host=localhost; Port=3306; Database=quanlynhahang; User Id=root; Password=nhox9x01";

        /// <summary>
        /// API Đăng ký người dùng
        /// </summary>
        /// <param name="user">Thông tin đăng ký</param>
        /// <returns>Trạng thái đăng ký</returns>
        [HttpPost("register")]
        public IActionResult Register(User user)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra thông tin đầu vào
                    if (string.IsNullOrWhiteSpace(user.Username) ||
                        string.IsNullOrWhiteSpace(user.Password) ||
                        string.IsNullOrWhiteSpace(user.Email))
                    {
                        return BadRequest(new { message = "Thông tin không hợp lệ." });
                    }

                    // Kiểm tra tài khoản đã tồn tại
                    var checkUserQuery = "SELECT COUNT(*) FROM user WHERE Username = @Username";
                    var userExists = sqlConnection.ExecuteScalar<int>(checkUserQuery, new { user.Username });

                    if (userExists > 0)
                    {
                        return Conflict(new { message = "Tên tài khoản đã tồn tại." });
                    }

                    // Thêm người dùng vào CSDL
                    var insertQuery = @"
                        INSERT INTO user (UserId, Username, Password, Email, IsAdmin)
                        VALUES (@UserId, @Username, @Password, @Email, @IsAdmin)";
                    user.UserId = Guid.NewGuid();

                    var result = sqlConnection.Execute(insertQuery, user);

                    if (result > 0)
                    {
                        return Ok(new { message = "Đăng ký thành công." });
                    }
                    return StatusCode(StatusCodes.Status500InternalServerError, "Không thể đăng ký người dùng.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }

        /// <summary>
        /// API Đăng nhập người dùng
        /// </summary>
        /// <param name="loginRequest">Thông tin đăng nhập</param>
        /// <returns>Trạng thái đăng nhập và điều hướng</returns>
        [HttpPost("login")]
        public IActionResult Login(LoginRequest loginRequest)
        {
            try
            {
                using (var sqlConnection = new MySqlConnection(_connectionString))
                {
                    // Kiểm tra thông tin đầu vào
                    if (string.IsNullOrWhiteSpace(loginRequest.Username) || string.IsNullOrWhiteSpace(loginRequest.Password))
                    {
                        return BadRequest(new { message = "Tên tài khoản và mật khẩu không được để trống." });
                    }

                    // Tìm người dùng theo tên tài khoản
                    var query = "SELECT UserId, Username, Password, IsAdmin, Email FROM user WHERE Username = @Username";
                    var user = sqlConnection.QuerySingleOrDefault<User>(query, new { loginRequest.Username });

                    if (user == null || loginRequest.Username != user.Username || loginRequest.Password != user.Password)
                    {
                        return BadRequest(new { message = "Tài khoản hoặc mật khẩu không chính xác." });
                    }

                    // Điều hướng theo vai trò
                    string redirectUrl;

                    if (user.IsAdmin == 1)
                    {
                        redirectUrl = "admindashboard.html";
                    }
                    else if (user.IsAdmin == 2)
                    {
                        redirectUrl = "staffdashboard.html";
                    }
                    else if (user.IsAdmin == 3)
                    {
                        redirectUrl = "staffdeliverydashboard.html";
                    }
                    else
                    {
                        redirectUrl = "customerdashboard.html";
                    }

                    return Ok(new
                    {
                        message = "Đăng nhập thành công",
                        UserId = user.UserId,
                        Username = user.Username,
                        IsAdmin = user.IsAdmin,
                        Email = user.Email,
                        RedirectUrl = redirectUrl
                    });

                }
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, $"Lỗi: {ex.Message}");
            }
        }
    }
}
