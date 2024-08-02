namespace Web.Misaweb2024.Api.Model
{
    public class Employee
    {

        public Guid EmployeeId { get; set; }
        public String EmployeeCode { get; set; }
        public String FullName { get; set; }
        public int ? Gender { get; set; }
        public String? GenderName { 
            get {
                switch (Gender)
                {
                    case 0:
                        return "Nam";
                    case 1:
                        return "Nữ";
                    case 2:
                        return "Không xác định";
                    default:
                        break;
                }
                return "Nam";
            }

        }
        public DateTime DateOfBirth { get; set; }
        public DateTime DateOfDeath { get; set; }
    }
}
