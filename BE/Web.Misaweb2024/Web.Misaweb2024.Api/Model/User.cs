namespace Web.Misaweb2024.Api.Model
{
    public class User
    {
        public Guid UserId { get; set; }
        public string Username { get; set; }
        public string Password { get; set; } // Mật khẩu gốc từ người dùng
        public string Email { get; set; }
        public int IsAdmin { get; set; }  // IsAdmin là kiểu int (1 = admin, 0 = employee)
    }
}
