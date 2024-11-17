$(document).ready(function() {
    // Lắng nghe sự kiện click trên nút toggleNavbar
    $("#toggleNavbar").on('click', function() {
        toggleNavbar();
    });

    // Hàm toggleNavbar
    function toggleNavbar() {
        try {
            var navbar = $('#navbar');
            navbar.toggleClass('collapsed');

            // Thay đổi nội dung nút
            var toggleButton = $("#toggleNavbar");
            if (navbar.hasClass('collapsed')) {
                toggleButton.text('Mở rộng');
            } else {
                toggleButton.text('Thu gọn');
            }

        } catch (error) {
            console.error(error);
        }
    }
});
