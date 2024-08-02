using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography.X509Certificates;
using MySqlConnector;
using Dapper;
using Web.Misaweb2024.Api.Model;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmployeesController : ControllerBase
    {

        /// <summary>
        /// Lấy danh sách toàn bộ nhân viên
        /// </summary>
        /// <returns>
        /// 200-Danh sách khách hàng
        /// 204-KHông có dữ liệu
        /// </returns>
        /// Crearedby: TQHUY(25/7/2024)
        [HttpGet]
        public IActionResult GetAllEmployees()
        {
            // Khai báo thông tin kết nối cơ sở dữ liệu
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";

            // Khởi tạo kết nối với MariaDB
            using (var sqlConnection = new MySqlConnection(connectionString))
            {
                // Câu lệnh truy vấn để lấy thông tin tất cả nhân viên, cùng tên vị trí và tên phòng ban
                var sqlCommand = @"
                SELECT e.*, p.PositionName, d.DepartmentName
                FROM Employee e
                LEFT JOIN Positions p ON e.PositionID = p.PositionID
                LEFT JOIN Department d ON e.DepartmentID = d.DepartmentID";

                // Thực hiện truy vấn và lấy danh sách tất cả nhân viên
                var employees = sqlConnection.Query<Employee>(sql: sqlCommand).ToList();

                // Trả kết quả cho Client
                return Ok(employees);
            }
        }


        /// <summary>
        /// Lấy ra nhân viên cụ thể
        /// </summary>
        /// <returns>
        /// 200-Danh sách khách hàng
        /// 204-KHông có dữ liệu
        /// </returns>
        /// Crearedby: TQHUY(25/7/2024
        [HttpGet("{employeeId}")]
        public IActionResult GetByID(Guid employeeId)
        {
            // Khai báo thông tin kết nối cơ sở dữ liệu
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";

            // Khởi tạo kết nối với MariaDB
            using (var sqlConnection = new MySqlConnection(connectionString))
            {
                // Câu lệnh truy vấn để lấy thông tin nhân viên, tên vị trí và tên phòng ban
                var sqlCommand = @"
            SELECT e.*, p.PositionName, d.DepartmentName
            FROM Employee e
            LEFT JOIN Positions p ON e.PositionID = p.PositionID
            LEFT JOIN Department d ON e.DepartmentID = d.DepartmentID
            WHERE e.EmployeeID = @EmployeeID";

                // Khởi tạo DynamicParameters và thêm tham số
                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeID", employeeId);

                // Thực hiện truy vấn và lấy thông tin nhân viên cụ thể
                var employee = sqlConnection.QueryFirstOrDefault<Employee>(sql:sqlCommand, param:parameters);

                if (employee == null)
                {
                    return NotFound("Employee not found.");
                }

                // Trả kết quả cho Client
                return Ok(employee);
            }
        }

        /// <summary>
        /// Thêm mới nhân viên
        /// </summary>
        /// <param name="newEmployee"></param>
        /// <returns></returns>




        /// <summary>
        /// Xóa nhân viên cụ thể
        /// </summary>
        /// <param name="employeeId"></param>
        /// <returns></returns>
        [HttpDelete("{employeeId}")]
        public IActionResult Delete(Guid employeeId)
        {
            // Khai báo thông tin kết nối cơ sở dữ liệu
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";

            // Khởi tạo kết nối với MariaDB
            using (var sqlConnection = new MySqlConnection(connectionString))
            {
                // Câu lệnh truy vấn để xóa dữ liệu
                var sqlCommand = "DELETE FROM Employee WHERE EmployeeID=@EmployeeID";

                // Khởi tạo DynamicParameters và thêm tham số
                var parameters = new DynamicParameters();
                parameters.Add("@EmployeeID", employeeId);

                // Thực hiện xóa dữ liệu
                var affectedRows = sqlConnection.Execute(sqlCommand, parameters);

                // Kiểm tra số hàng bị ảnh hưởng
                if (affectedRows > 0)
                {
                    return NoContent(); // Trả về HTTP 204 No Content nếu xóa thành công
                }
                else
                {
                    return NotFound(); // Trả về HTTP 404 Not Found nếu không tìm thấy bản ghi để xóa
                }
            }
        }

        
       
        


    }
}
