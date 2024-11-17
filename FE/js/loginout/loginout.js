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
 signInButton.addEventListener("click", function(event) {
        event.preventDefault(); // Ngăn chặn hành vi submit mặc định
        window.location.href = "employee.html"; // Chuyển đến trang employee.html
 });