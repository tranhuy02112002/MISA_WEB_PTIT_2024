namespace Web.Misaweb2024.Api.Model
{
    public class Food
    {
        public Guid FoodID { get; set; }
        public String FoodName { get; set; }  
        public Decimal FoodPrice { get; set; }
        public String ImageUrl { get; set; }
    }
}
