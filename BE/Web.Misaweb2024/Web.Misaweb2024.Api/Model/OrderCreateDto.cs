using System;
using System.Collections.Generic;

namespace Web.Misaweb2024.Api.Model
{
    public class OrderCreateDto
    {
        public Guid TableID { get; set; }
        public string CustomerName { get; set; }
        public string CustomerPhone { get; set; }
        public string CustomerEmail { get; set; }
        public decimal DiscountPercentage { get; set; }
        public decimal TotalAmount { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; }
    }
}
