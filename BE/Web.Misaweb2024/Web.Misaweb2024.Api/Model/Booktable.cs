namespace Web.Misaweb2024.Api.Model
{
    public class Booktable
    {
        public Guid BooktableId { get; set; }
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerEmail { get; set; }
        public DateTime Bookdate { get; set; }
        public int GuestCount { get; set; }
        public Guid TableId { get; set; }
        public int Status { get; set; }

    }
}
