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
        public DateTime ? DateOfBirth { get; set; }
        public Guid ? PositionID { get; set; }
        public String? PositionName { get; set; }

        public Guid ? DepartmentID { get; set; }
        public String ? DepartmentName { get; set; }
        public String ? IdentityNumber { get; set; }

        public DateTime ? IdentityDate { get; set; }

        public String? IdentityPlace { get; set; }

        public String? Email { get; set; }

        public String? PhoneNumber { get; set; }

        public String? LandlineNumber { get; set; }
        public String? Address { get; set; }
        public String? BankAccount { get; set; }
        public String? BankName { get; set; }
        public String? Branch { get; set; }
        public DateTime? CreatedDate { get; set; }

        public String? CreatedBy { get; set; }
        public DateTime? ModifiedDate { get; set; }

        public String? ModifiedBy { get; set; }



    }
}
