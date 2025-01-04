const sign_in_btn = document.querySelector("#sign-in-btn");
const sign_up_btn = document.querySelector("#sign-up-btn");
const signInButton = document.querySelector("#sign-in");

const container = document.querySelector(".container");

sign_up_btn.addEventListener("click", () => {
  container.classList.add("sign-up-mode");
});

sign_in_btn.addEventListener("click", () => {
  container.classList.remove("sign-up-mode");
});

$(document).ready(function () {
  // Xử lý đăng ký
  $("#btn-register").on("click", function () {
    const username = $("#register-username").val().trim();
    const password = $("#register-password").val().trim();
    const email = $("#register-email").val().trim();

    if (!username || !password || !email) {
      alert("Vui lòng nhập đầy đủ thông tin đăng ký.");
      return;
    }

    const user = {
      Username: username,
      Password: password,  // Mật khẩu thô, API sẽ hash
      Email: email,
      IsAdmin: 0, // Mặc định là không phải admin, có thể thay đổi tùy yêu cầu
    };

    $.ajax({
      url: "http://localhost:5014/api/v1/Loginouts/register",  // Cập nhật URL API
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(user),
      success: function (response) {
        alert("Đăng ký thành công! Bạn có thể đăng nhập.");
        window.location.href = "loginout.html"; // Điều hướng đến trang đăng nhập
      },
      error: function (error) {
        alert("Lỗi khi đăng ký: " + (error.responseJSON?.message || "Không xác định."));
        console.error(error);
      },
    });
  });

  // Xử lý đăng nhập
  $("#btn-login").on("click", function () {
    const username = $("#login-username").val().trim();
    const password = $("#login-password").val().trim();

    if (!username || !password) {
      alert("Vui lòng nhập đầy đủ thông tin đăng nhập.");
      return;
    }

    const loginRequest = {
      Username: username,
      Password: password,
    };

    $.ajax({
      url: "http://localhost:5014/api/v1/Loginouts/login",  // Cập nhật URL API
      type: "POST",
      contentType: "application/json",
      data: JSON.stringify(loginRequest),
      success: function (response) {
        
        alert(response.message);

        // Lưu thông tin người dùng vào localStorage
        localStorage.setItem("userId", response.UserId);
        localStorage.setItem("username", response.Username);
        localStorage.setItem("email",response.Email);
        localStorage.setItem("isAdmin", response.IsAdmin);  // Lưu giá trị IsAdmin từ response

        // Điều hướng đến trang phù hợp
        window.location.href = response.RedirectUrl;  // Điều hướng theo vai trò
      },
      error: function (error) {
        alert("Lỗi khi đăng nhập: " + (error.responseJSON?.message || "Không xác định."));
        console.error(error);
      },
    });
  });

  // Kiểm tra trạng thái đăng nhập
  function checkAuth() {
    const username = localStorage.getItem("username");

    if (!username) {
      alert("Vui lòng đăng nhập để tiếp tục.");
      window.location.href = "loginout.html";
    }
  }

  // Ví dụ: Gọi hàm kiểm tra khi tải trang dashboard
  if (window.location.pathname.includes("dashboard.html")) {
    checkAuth();
  }
});
