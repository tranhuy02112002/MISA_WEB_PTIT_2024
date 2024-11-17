// Hiển thị hoặc ẩn form
function toggleForm() {
    const form = document.getElementById("addFoodForm");
    form.classList.toggle("active");
}

// Thêm món ăn mới
function addFood() {
    // Lấy dữ liệu từ form
    const foodName = document.getElementById("foodName").value;
    const foodPrice = document.getElementById("foodPrice").value;
    const foodImage = document.getElementById("foodImage").files[0];

    if (!foodName || !foodPrice || !foodImage) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // Tạo URL hình ảnh tạm thời
    const imageUrl = URL.createObjectURL(foodImage);

    // Thêm món ăn mới vào danh sách
    const foodList = document.getElementById("foodList");
    const newFoodItem = `
        <div class="food-item">
            <img class="food-image" src="${imageUrl}" alt="Món ăn">
            <div class="food-details">
                <p class="food-name">${foodName}</p>
                <p class="food-price">${Number(foodPrice).toLocaleString()} VNĐ</p>
                <div class="actions">
                    <button class="btn btn-edit">Sửa</button>
                    <button class="btn btn-delete">Xóa</button>
                </div>
            </div>
        </div>
    `;
    foodList.insertAdjacentHTML("beforeend", newFoodItem);

    // Reset form và ẩn form
    document.getElementById("foodName").value = "";
    document.getElementById("foodPrice").value = "";
    document.getElementById("foodImage").value = "";
    toggleForm();
}
