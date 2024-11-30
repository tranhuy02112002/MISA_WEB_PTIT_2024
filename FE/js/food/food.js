$(document).ready(function () {

    // Hàm tải danh sách món ăn từ API
    function loadFoodItems() {
        let dem = 0;
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods', // Gọi API lấy danh sách món ăn
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log(response);
                var foodList = $("#foodList");
                foodList.empty(); // Xóa danh sách món ăn hiện tại

                if (response.length === 0) {
                    foodList.append("<p>Không có món ăn nào.</p>");
                    return;
                }

                // Duyệt qua danh sách món ăn và hiển thị
                response.forEach(function (food) {
                    var foodItemHtml = `
                        <div class="food-item" data-id="${food.FoodId}">
                            <img class="food-image" src="../assets/img/imgfood/${food.ImageUrl}" alt="Món ăn">
                            <div class="food-details">
                                <p class="food-name">${food.FoodName}</p>
                                <p class="food-price">${food.FoodPrice.toLocaleString()} VNĐ</p>
                                <div class="actions">
                                    <button class="btn btn-edit" data-id="${food.FoodID}">Sửa</button>
                                    <button class="btn btn-delete" data-id="${food.FoodID}">Xóa</button>
                                </div>
                            </div>
                        </div>
                    `;
                    dem++;
                    foodList.append(foodItemHtml); // Thêm món ăn vào danh sách
                });
                //Cập nhật tổng số món ăn
                $(".count-food").text("Tổng số món: " + dem);

            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách món ăn.", error);
                alert("Không thể tải danh sách món ăn.");
            }
        });
    }

    // Gọi hàm loadFoodItems khi trang được tải
    loadFoodItems();

    // Xử lý form thêm món ăn
    $(".btn-add").on('click', function () {
        $("#addFoodForm").show();  // Hiển thị form thêm món ăn
        // Reset form và thay đổi hành động khi nhấn nút "Lưu" thành thêm món ăn
        $("#foodName").val('');
        $("#foodPrice").val('');
        $("#foodImage").val('');  // Nếu có ô input cho ảnh
        $(".btn-save").text('Lưu');  // Đổi button save thành cập nhật
        $(".btn-save").off('click').on('click', function () {
            addFood();  // Gọi hàm addFood khi nhấn lưu
        });
    });
    

    // Hủy form
    $(".btn-cancel").on('click', function () {
        $("#addFoodForm").toggle();  // Đóng form
    });

    // Hàm gửi yêu cầu thêm món ăn
    function addFood() {
        const foodName = document.getElementById("foodName").value;
        const foodPrice = document.getElementById("foodPrice").value;
        const foodImageInput = document.getElementById("foodImage").files[0];
        const foodUrl = foodImageInput.name;
        console.log(foodUrl);
    
        // Kiểm tra dữ liệu đầu vào
        if (!foodName || !foodPrice || !foodUrl) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }
    
        // Trích xuất đường dẫn tạm thời từ file đã chọn    
        const foodItem = {
            FoodName: foodName,
            FoodPrice: parseFloat(foodPrice),
            ImageUrl: foodUrl, // Sử dụng đường dẫn tạm thời này
        };
    
        // Gửi yêu cầu thêm món ăn đến API
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(foodItem),
            success: function (response) {
                alert("Món ăn đã được thêm thành công!");
                $("#addFoodForm").toggle();
                loadFoodItems(); // Tải lại danh sách món ăn
            },
            error: function (error) {
                alert("Lỗi khi thêm món ăn: " + error.responseJSON.message);
                console.error(error);
            }
        });
    }

    // Xử lý xóa món ăn
    $(document).on('click', '.btn-delete', function () {
        var foodId = $(this).data('id');
        console.log(foodId);
        deleteFood(foodId);
    });

    // Hàm xóa món ăn
    function deleteFood(foodId) {
        if (confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
            $.ajax({
                url: 'http://localhost:5014/api/v1/Foods/' + foodId,  // Cập nhật URL đúng cho API xóa món ăn
                type: 'DELETE',
                success: function (response) {
                    alert("Món ăn đã được xóa.");
                    loadFoodItems();  // Tải lại danh sách món ăn
                },
                error: function (error) {
                    alert("Lỗi khi xóa món ăn.");
                    console.error(error);
                }
            });
        }
    }

    // Xử lý sửa món ăn
    $(document).on('click', '.btn-edit', function () {
        var foodId = $(this).data('id');
        editFood(foodId);  // Gọi hàm editFood khi nhấn nút Sửa
    });

    // Hàm lấy thông tin món ăn và điền vào form sửa
    function editFood(foodId) {
        // Lấy thông tin món ăn hiện tại
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods/' + foodId,  // API lấy chi tiết món ăn
            type: 'GET',
            success: function (food) {
                // Điền thông tin vào form sửa
                $("#foodId").val(food.FoodID);
                $("#foodName").val(food.FoodName);
                $("#foodPrice").val(food.FoodPrice);
                $("#foodImage").attr("src", "C:/Users/HUY TRAN/Desktop/MISA-TT/MISA_WEB_PTIT_2024/FE/assets/img/imgfood/" + food.ImageUrl);  // Hiển thị ảnh cũ
                $("#addFoodForm").show();  // Hiển thị form để sửa
                $(".btn-save").text('Cập nhật món ăn');  // Đổi button save thành cập nhật

                // Thay đổi hành động khi nhấn nút lưu
                $(".btn-save").off('click').on('click', function () {
                    updateFood(food.FoodID);  // Gọi hàm updateFood khi nhấn lưu
                });
            },
            error: function (error) {
                alert("Lỗi khi lấy thông tin món ăn.");
                console.error(error);
            }
        });
    }

    // Hàm cập nhật món ăn
    function updateFood(foodId) {
        var foodName = $("#foodName").val();
        var foodPrice = $("#foodPrice").val();
        var foodImage = $("#foodImage")[0].files[0];  // Lấy tệp hình ảnh mới (nếu có)

        if (foodName === "" || foodPrice === "") {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Tạo đối tượng món ăn mới với thông tin sửa
        var foodItem = {
            FoodId: foodId,
            FoodName: foodName,
            FoodPrice: parseFloat(foodPrice),
            ImageUrl: foodImage.name
        };

        // Gửi yêu cầu cập nhật món ăn
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods/' + foodId,  // API cập nhật món ăn
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(foodItem),
            success: function (response) {
                alert("Món ăn đã được cập nhật.");
                loadFoodItems(); // Tải lại danh sách món ăn
                $("#addFoodForm").toggle();  // Đóng form
            },
            error: function (error) {
                alert("Lỗi khi cập nhật món ăn.");
                console.error(error);
            }
        });
    }

});
