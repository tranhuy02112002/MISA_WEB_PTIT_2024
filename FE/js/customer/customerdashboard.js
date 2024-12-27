$(document).ready(function() {
    // Load comments
    function loadComments() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Comment',
            method: 'GET',
            dataType: 'json',
            success: function(comments) {
                const container = $('#comments-container');
                container.empty();
                console.log(comments);
                comments.forEach(comment => {
                    const commentHtml = `
                        <div class="comment-item">
                            <div class="customer-name">${comment.CustomerName}</div>
                            <div class="comment-content">${comment.Content}</div>
                            <div class="comment-date">${formatDate(comment.CreatedAt)}</div>
                        </div>
                    `;
                    container.append(commentHtml);
                });
            },
            error: function(xhr, status, error) {
                console.error('Lỗi khi tải bình luận:', error);
                alert('Không thể tải bình luận. Vui lòng thử lại.');
            }
        });
    }

    // Hàm định dạng ngày
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('vi-VN');
    }

    // Submit comment
    $('#submit-comment').click(function() {
        const content = $('#comment-content').val().trim();
        const customerName = localStorage.getItem('username') || 'Khách';

        if (!content) {
            alert('Vui lòng nhập nội dung bình luận');
            return;
        }

        const commentData = {
            content: content,
            customerName: customerName
        };

        $.ajax({
            url: 'http://localhost:5014/api/v1/Comment',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(commentData),
            success: function() {
                $('#comment-content').val('');
                loadComments();
            },
            error: function(xhr, status, error) {
                console.error('Lỗi khi gửi bình luận:', error);
                alert('Gửi bình luận thất bại. Vui lòng thử lại.');
            }
        });
    });

    // Load comments on page load
    loadComments();
});
