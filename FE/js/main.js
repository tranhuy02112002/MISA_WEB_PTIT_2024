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

$(document).ready(function () {
    // Hiển thị tên người dùng khi đăng nhập
    const username = localStorage.getItem("username");
    const email = localStorage.getItem("email");
    if (username) {
        $("#username-display").text(username); // Hiển thị tên người dùng
        $('#user-name-display').text(username);  // Cập nhật tên trong menu đăng xuất
        $('#user-email-display').text(email);  // Cập nhật tên trong menu đăng xuất
    } else {
        $("#username-display").text("Guest"); // Trường hợp chưa đăng nhập
        $('#user-name-display').text("Guest");  // Cập nhật tên trong menu đăng xuất
    }

    // Hiển thị menu Đăng Xuất khi nhấn vào icon
    $("#logout-icon").on("click", function () {
        const logoutMenu = $("#logout-menu");
        logoutMenu.toggle(); // Hiển thị hoặc ẩn menu
    });

    // Xử lý đăng xuất
    $("#btn-logout").on("click", function () {
        localStorage.removeItem("username");
        localStorage.removeItem("isAdmin");
        localStorage.removeItem("email");
        alert("Bạn đã đăng xuất thành công!");
        window.location.href = "loginout.html"; // Điều hướng về trang đăng nhập
    });

    // Ẩn menu khi nhấn ngoài khu vực
    $(document).on("click", function (event) {
        const target = $(event.target);
        if (!target.closest("#logout-icon").length && !target.closest("#logout-menu").length) {
            $("#logout-menu").hide();
        }
    });
});
