using System;

namespace Web.Misaweb2024.Api.Model
{
    public class OrderDetailDto
    {
        public Guid FoodID { get; set; }
        public int Quantity { get; set; }
        public decimal Price { get; set; }
    }
}
