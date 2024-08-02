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
        public IActionResult Get()
        {   //Khai báo thông tin database
            var connectionString = "Host=8.222.228.150; Port=3306; Database = PTIT_B20DCCN329_TranQuangHuy;User Id =manhnv; Password=12345678";
            //1.1 KHởi tạo kết nói với MariaDB
            var sqlConnecttion = new MySqlConnection(connectionString);


            //2.Lấy dữ liệu:
            //2.1 Câu lệnh truy vấn lất dữ liệu
            var sqlCommand = "SELECT * FROM Employee";
            //2.2 Thực hiện lấy dữ liệu
            var employees = sqlConnecttion.Query<Employee>(sql: sqlCommand);


            //Trả kết quả cho Client
            return Ok(employees);
        }

        /// <summary>
        /// Lấy ra nhân viên cụ thể
        /// </summary>
        /// <returns>
        /// 200-Danh sách khách hàng
        /// 204-KHông có dữ liệu
        /// </returns>
        /// Crearedby: TQHUY(25/7/2024)
        [HttpGet("{employeeId}")]
        public IActionResult GetByID(Guid employeeId)
        {   //Khai báo thông tin database
            var connectionString = "Host=8.222.228.150; Port=3306; Database = PTIT_B20DCCN329_TranQuangHuy;User Id =manhnv; Password=12345678";
            //1.1 KHởi tạo kết nói với MariaDB
            var sqlConnecttion = new MySqlConnection(connectionString);


            //2.Lấy dữ liệu:
            //2.1 Câu lệnh truy vấn lất dữ liệu
            var sqlCommand = $"SELECT * FROM Employee WHERE EmployeeID=@EmployeeID";

            DynamicParameters parameters = new DynamicParameters();
            parameters.Add("@EmployeeID", employeeId);

           
            //2.2 Thực hiện lấy dữ liệu
            var employee = sqlConnecttion.QueryFirstOrDefault<Employee>(sql: sqlCommand,param:parameters);


            //Trả kết quả cho Client
            return Ok(employee);
        }

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

        /// <summary>
        /// Thêm mới nhân viên
        /// </summary>
        /// <param name="newEmployee"></param>
        /// <returns></returns>
       
        


    }
}
