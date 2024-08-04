using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Cryptography.X509Certificates;
using MySqlConnector;
using Dapper;
using Web.Misaweb2024.Api.Model;
using System.Net.WebSockets;

namespace Web.Misaweb2024.Api.Controllers
{
    [Route("api/v1/[controller]")]
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
            try
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
            catch (Exception ex)
            {
              return HandleException(ex);
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
            try
            {
                // Khai báo thông tin kết nối cơ sở dữ liệu
                var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";

                // Khởi tạo kết nối với MariaDB
                using (var sqlConnection = new MySqlConnection(connectionString))
                {   
                    //Nếu thực hiện gọi tiếp các hàm khác thì không cần trycatch nữa
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
                    var employee = sqlConnection.QueryFirstOrDefault<Employee>(sql: sqlCommand, param: parameters);

                    if (employee == null)
                    {
                        return NotFound("Employee not found.");
                    }

                    // Trả kết quả cho Client
                    return Ok(employee);
                }
            }
            catch (Exception ex) 
            {

                 return HandleException(ex);

            }


        }

        /// <summary>
        /// Lấy ra danh sách nhân viên theo vị trí, phòng ban
        /// </summary>
        /// <returns>
        /// 200-Danh sách khách hàng
        /// 204-KHông có dữ liệu
        /// </returns>
        /// Crearedby: TQHUY(25/7/2024
        [HttpGet("search/{searchTerm}")]
        public IActionResult GetBySearchTerm(string searchTerm)
        {
            try
            {
                // Khai báo thông tin kết nối cơ sở dữ liệu
                var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";

                // Khởi tạo kết nối với MariaDB
                using (var sqlConnection = new MySqlConnection(connectionString))
                {
                    // Câu lệnh truy vấn để tìm kiếm theo PositionName hoặc DepartmentName
                    var sqlCommand = @"
                        SELECT e.*
                        FROM Employee e
                        LEFT JOIN Positions p ON e.PositionID = p.PositionID
                        LEFT JOIN Department d ON e.DepartmentID = d.DepartmentID
                        WHERE p.PositionName LIKE CONCAT('%', @SearchTerm, '%')
                        OR d.DepartmentName LIKE CONCAT('%', @SearchTerm, '%')";

                    // Khởi tạo DynamicParameters và thêm tham số
                    var parameters = new DynamicParameters();
                    parameters.Add("@SearchTerm", searchTerm);

                    // Thực hiện truy vấn và lấy danh sách nhân viên phù hợp
                    var employees = sqlConnection.Query<Employee>(sql: sqlCommand, param: parameters).ToList();

                    // Trả kết quả cho Client
                    return Ok(employees);
                }
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }



        /// <summary>
        /// Thêm mới nhân viên
        /// </summary>
        /// <param name="newEmployee"></param>
        /// <returns>
        /// 201-Thêm mới thành công
        /// 400-Dữ liệu đầu vào không hợp lệ
        /// 500-Có lôi exception
        /// </returns>
        /// Crearedby: TQHUY(25/7/2024

        [HttpPost]
        public IActionResult Post(Employee employee)
        {
            try
            {
                //Khai báo các thông tin cần thiết
                var error = new ErrorService();
                var ErrorData = new Dictionary<String, String>();
                var errorMsg = new List<string>();

                //Bước 1. Validate dữ liệu: tra về mã 400 (BadRequest) kèm các thông tin lỗi cần thiết
                //1.1 Thông tin mã nhân viên bắt buộc nhập
                if (String.IsNullOrEmpty(employee.EmployeeCode))
                {
                    ErrorData.Add("EmpoyeeCode", "Mã nhân viên không được phép để trống");
                }
              
                //1.2 Thông tin họ và tên không được phép để trống
                if (String.IsNullOrEmpty(employee.FullName))
                {
                    ErrorData.Add("FullName", "Tên nhân viên không được phép để trống");
                }

                //1.3 Thông tin Email không được phép để trống và đúng định dạng
                if (String.IsNullOrEmpty(employee.Email))
                {
                    ErrorData.Add("Email", "Email không được phép để trống");
                }else if (!IsValidEmail(employee.Email))
                {
                    ErrorData.Add("Email", "Email không đúng định dạng");
                }

                //1.4 Ngày sinh không được lớn hơn ngày hiện tại

                 if (employee.DateOfBirth > DateTime.Now)
                 {
                    ErrorData.Add("DateOfBirth", "Ngày sinh không được lớn hơn ngày hiện tại");

                 }
                //1.5 Số điện thoại không được phép để trống
                if (String.IsNullOrEmpty(employee.PhoneNumber))
                {
                    ErrorData.Add("PhoneNumber", "Số điện thoại không được phép để trống");
                }
                //1.6 Mã nhân viên không được phép để trùng
                if (CheckEmployeeCode(employee.EmployeeCode)) {
                    ErrorData.Add("EmployeeCode", "Mã nhân viên đã bị trùng");
                }

                //1.7 Ngày cấp cccd không được lớn hơn ngày hiện tại
                if (employee.IdentityDate > DateTime.Now)
                {
                    ErrorData.Add("IdentityDate", "Ngày cấp cccd không được lớn hơn ngày hiện tại");

                }

                //1.8 Thông tin cccd không được phép để trống
                if (String.IsNullOrEmpty(employee.IdentityNumber))
                {
                    ErrorData.Add("IdentityNumber", "Số CMTND không được phép đẻ trống");
                }




                if (ErrorData.Count > 0)
                {
                    error.UserMsg = "Dữ liêu đầu vào không hợp lệ";
                    error.Data = ErrorData;
                    return BadRequest(error);
                }

                //Bước 2. Khởi tạo kết nối đến Database
                var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";
                var mySqlConnection = new MySqlConnection(connectionString);



                //Bước 3. Thực hiện thêm mới dữ liệu vào database
                var sqlCommand = @"INSERT INTO Employee (EmployeeId, EmployeeCode, FullName, DateOfBirth, Gender, IdentityNumber, IdentityDate,
                   IdentityPlace, Email, PhoneNumber, LandlineNumber, Address, BankAccount, BankName, Branch, PositionId, DepartmentId,
                   CreatedDate, CreatedBy, ModifiedDate, ModifiedBy)
                   VALUES (@EmployeeId, @EmployeeCode, @FullName, @DateOfBirth, @Gender, @IdentityNumber, @IdentityDate, @IdentityPlace, @Email,
                   @PhoneNumber, @LandlineNumber, @Address, @BankAccount, @BankName, @Branch, @PositionId, @DepartmentId,
                   @CreatedDate, @CreatedBy, @ModifiedDate, @ModifiedBy);";

                // Tạo mới EmployeeID và gán giá trị cho PositionID:
                employee.EmployeeId = Guid.NewGuid();
                employee.PositionID = GetPositionIdByName(employee.PositionName);
                employee.DepartmentID = GetDepartmentIdByName(employee.DepartmentName);

                var res = mySqlConnection.Execute(sql: sqlCommand, param: new
                {
                    employee.EmployeeId,
                    employee.EmployeeCode,
                    employee.FullName,
                    employee.DateOfBirth,
                    employee.Gender,
                    employee.IdentityNumber,
                    employee.IdentityDate,
                    employee.IdentityPlace,
                    employee.Email,
                    employee.PhoneNumber,
                    employee.LandlineNumber,
                    employee.Address,
                    employee.BankAccount,
                    employee.BankName,
                    employee.Branch,
                    employee.PositionID,  // Đảm bảo thuộc tính này có giá trị hợp lệ
                    employee.DepartmentID,
                    employee.CreatedDate,
                    employee.CreatedBy,
                    employee.ModifiedDate,
                    employee.ModifiedBy
                });


                //Bước 4: Trả thông tin về cho client
                if (res > 0)
                {
                    return StatusCode(201, res);

                }
                else
                {
                    return Ok(res);
                }
            }
            catch (Exception ex)
            {
                return HandleException(ex);

            }

        }



        /// <summary>
        /// Sửa thông tin nhân viên
        /// </summary>
        /// <param name="id"></param>
        /// <param name="employee"></param>
        /// <returns></returns>
        ///Crearedby: TQHUY(25/7/2024)


        [HttpPut("{id}")]
        public IActionResult Put(Guid id, Employee employee)
        {
            try
            {


                // Bước 1. Validate dữ liệu (tương tự như trong hàm POST)
                var error = new ErrorService();
                var ErrorData = new Dictionary<String, String>();

                //1.1 Thông tin mã nhân viên bắt buộc nhập
                if (String.IsNullOrEmpty(employee.EmployeeCode))
                {
                    ErrorData.Add("EmpoyeeCode", "Mã nhân viên không được phép để trống");
                }

                //1.2 Thông tin họ và tên không được phép để trống
                if (String.IsNullOrEmpty(employee.FullName))
                {
                    ErrorData.Add("FullName", "Tên nhân viên không được phép để trống");
                }
                //1.3 Thông tin Email không được phép để trống và đúng định dạng
                if (String.IsNullOrEmpty(employee.Email))
                {
                    ErrorData.Add("Email", "Email không được phép để trống");
                }
                else if (!IsValidEmail(employee.Email))
                {
                    ErrorData.Add("Email", "Email không đúng định dạng");
                }

                //1.4 Ngày sinh không được lớn hơn ngày hiện tại
                if (employee.DateOfBirth > DateTime.Now)
                {
                    ErrorData.Add("DateOfBirth", "Ngày sinh không được lớn hơn ngày hiện tại");
                }

                //1.5 Số điện thoại không được phép để trống
                if (String.IsNullOrEmpty(employee.PhoneNumber))
                {
                    ErrorData.Add("PhoneNumber", "Số điện thoại không được phép để trống");
                }
                //1.6 Ngày cấp cccd không được lớn hơn ngày hiện tại
                if (employee.IdentityDate > DateTime.Now)
                {
                    ErrorData.Add("IdentityDate", "Ngày cấp cccd không được lớn hơn ngày hiện tại");

                }

                //1.7 Thông tin cccd không được phép để trống
                if (String.IsNullOrEmpty(employee.IdentityNumber))
                {
                    ErrorData.Add("IdentityNumber", "Số CMTND không được phép đẻ trống");
                }


                if (ErrorData.Count > 0)
                {
                    error.UserMsg = "Dữ liệu đầu vào không hợp lệ";
                    error.Data = ErrorData;
                    return BadRequest(error);
                }

                // Bước 2. Khởi tạo kết nối đến Database
                var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";
                using (var mySqlConnection = new MySqlConnection(connectionString))
                {
                    // Bước 3. Thực hiện cập nhật dữ liệu vào database
                    var sqlCommand = @"UPDATE Employee SET 
                                EmployeeCode = @EmployeeCode,
                                FullName = @FullName,
                                DateOfBirth = @DateOfBirth,
                                Gender = @Gender,
                                IdentityNumber = @IdentityNumber,
                                IdentityDate = @IdentityDate,
                                IdentityPlace = @IdentityPlace,
                                Email = @Email,
                                PhoneNumber = @PhoneNumber,
                                LandlineNumber = @LandlineNumber,
                                Address = @Address,
                                BankAccount = @BankAccount,
                                BankName = @BankName,
                                Branch = @Branch,
                                PositionId = @PositionId,
                                DepartmentId = @DepartmentId,
                                CreatedDate = @CreatedDate,
                                CreatedBy = @CreatedBy,
                                ModifiedDate = @ModifiedDate,
                                ModifiedBy = @ModifiedBy
                               WHERE EmployeeId = @EmployeeId;";

                    // Cập nhật PositionId và DepartmentId nếu cần
                    employee.PositionID = GetPositionIdByName(employee.PositionName);
                    employee.DepartmentID = GetDepartmentIdByName(employee.DepartmentName);

                    var res = mySqlConnection.Execute(sql: sqlCommand, param: new
                    {
                        employee.EmployeeId,
                        employee.EmployeeCode,
                        employee.FullName,
                        employee.DateOfBirth,
                        employee.Gender,
                        employee.IdentityNumber,
                        employee.IdentityDate,
                        employee.IdentityPlace,
                        employee.Email,
                        employee.PhoneNumber,
                        employee.LandlineNumber,
                        employee.Address,
                        employee.BankAccount,
                        employee.BankName,
                        employee.Branch,
                        employee.PositionID,  // Đảm bảo thuộc tính này có giá trị hợp lệ
                        employee.DepartmentID,
                        employee.CreatedDate,
                        employee.CreatedBy,
                        employee.ModifiedDate,
                        employee.ModifiedBy
                    });

                    // Bước 4: Trả thông tin về cho client
                    if (res > 0)
                    {
                        return Ok(new { UserMsg = "Cập nhật thành công", Data = employee });
                    }
                    else
                    {
                        return NotFound(new { UserMsg = "Không tìm thấy nhân viên cần cập nhật" });
                    }
                }
            }
            catch (Exception ex)
            {
                return HandleException(ex);
            }
        }





        /// <summary>
        /// Xóa nhân viên cụ thể
        /// </summary>
        /// <param name="employeeId"></param>
        /// <returns></returns>
        [HttpDelete("{employeeId}")]



        public IActionResult Delete(Guid employeeId)
        {
            try
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
            catch (Exception ex)
            {
                return HandleException(ex);

            }

        }

        //Check EmployeeCode có trùng không
        //True - Là đã bị trùng, False - là không bị trùng
        private bool CheckEmployeeCode(String employeeCode)
        {
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";
            var mySqlConnection = new MySqlConnection(connectionString);
            var sqlCheck = "SELECT EmployeeCode FROM Employee  WHERE EmployeeCode = @EmployeeCode";
            var dynamicParams = new DynamicParameters();
            dynamicParams.Add("@EmployeeCode",employeeCode);
            var res = mySqlConnection.QueryFirstOrDefault<String>(sqlCheck, param: dynamicParams);
            if (res != null)
                return true;
            return false;
        }

        //Lấy ra PositionID dự vào PostionName
        private Guid? GetPositionIdByName(string positionName)
        {
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";
            using (var mySqlConnection = new MySqlConnection(connectionString))
            {
                // Mở kết nối
                mySqlConnection.Open();

                // Truy vấn SQL để lấy PositionId từ PositionName
                var sqlQuery = "SELECT PositionId FROM Positions WHERE PositionName = @PositionName";

                // Tạo đối tượng DynamicParameters và thêm tham số
                var dynamicParams = new DynamicParameters();
                dynamicParams.Add("@PositionName", positionName);

                // Thực hiện truy vấn và lấy PositionId
                var positionId = mySqlConnection.QueryFirstOrDefault<Guid?>(sqlQuery, param: dynamicParams);

                return positionId;
            }
        }

        //Lấy ra Departmant ID dưa vào DepartmentName
        private Guid? GetDepartmentIdByName(string departmentName)
        {
            var connectionString = "Host=8.222.228.150; Port=3306; Database=PTIT_B20DCCN329_TranQuangHuy; User Id=manhnv; Password=12345678";
            using (var mySqlConnection = new MySqlConnection(connectionString))
            {
                // Mở kết nối
                mySqlConnection.Open();

                // Truy vấn SQL để lấy DepartmentId từ DepartmentName
                var sqlQuery = "SELECT DepartmentId FROM Department WHERE DepartmentName = @DepartmentName";

                // Tạo đối tượng DynamicParameters và thêm tham số
                var dynamicParams = new DynamicParameters();
                dynamicParams.Add("@DepartmentName", departmentName);

                // Thực hiện truy vấn và lấy DepartmentId
                var departmentId = mySqlConnection.QueryFirstOrDefault<Guid?>(sqlQuery, param: dynamicParams);

                return departmentId;
            }
        }



        //Check Email
        bool IsValidEmail(string email)
        {
            var trimmedEmail = email.Trim();

            if (trimmedEmail.EndsWith("."))
            {
                return false; // suggested by @TK-421
            }
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == trimmedEmail;
            }
            catch
            {
                return false;
            }
        }

        //Exception
        private IActionResult HandleException(Exception ex)
        {
            var error = new ErrorService();
            error.DevMsg = ex.Message;
            error.UserMsg = Resources.ResourceVN.Error_Exception;
            error.Data = ex.Data;
            return StatusCode(500, error);
        }

    }
}
