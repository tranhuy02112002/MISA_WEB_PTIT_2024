namespace Web.Misaweb2024.Api.Model
{
    public class Ingredient
    {
        public Guid IngredientId { get; set; }
        public string IngredientName { get; set; }
        public decimal IngredientQuantity { get; set; }
        public string IngredientUnit { get; set; }
        public DateTime? IngredientExpired { get; set; }
        public string IngredientType { get; set; }
        public string IngredientStatus { get; set; }
    }
}
