namespace Web.Misaweb2024.Api.Model
{
    public class FoodDetailDto
    {
        public Guid FooddetailId { get; set; }
        public float Quantity { get; set; }
        public Guid FoodId { get; set; }
        public Guid IngredientId { get; set; }

    }
}
