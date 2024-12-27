namespace Web.Misaweb2024.Api.Model
{
    public class Comment
    {
        public Guid CommentId { get; set; }
        public string Content { get; set; }
        public string CustomerName { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
