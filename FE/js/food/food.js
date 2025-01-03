$(document).ready(function () {
    // Hàm tải danh sách món ăn từ API
    function loadFoodItems() {
        let dem = 0;
        $.ajax({
            url: 'http://localhost:5014/api/v1/FoodDetails',
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log(response);
                var foodList = $("#foodList");
                foodList.empty();

                if (response.length === 0) {
                    foodList.append("<p>Không có món ăn nào.</p>");
                    return;
                }

                response.forEach(function (food) {
                    var foodItemHtml = `
                        <div class="food-item" data-id="${food.FoodID}">
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
                    foodList.append(foodItemHtml);
                });
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
        $("#addFoodForm").show();
        $("#foodName").val('');
        $("#foodPrice").val('');
        $("#foodImage").val('');
        $("#ingredientList").empty(); // Reset danh sách nguyên liệu
        $(".btn-save").text('Lưu').off('click').on('click', function () {
            addFood();
        });
    });

    // Hủy form
    $(".btn-cancel").on('click', function () {
        $("#addFoodForm").hide();
    });

    // Hàm gửi yêu cầu thêm món ăn
    function addFood() {
        const foodName = $("#foodName").val();
        const foodPrice = $("#foodPrice").val();
        const foodImageInput = $("#foodImage")[0].files[0];
        const foodUrl = foodImageInput ? foodImageInput.name : '';

        // Kiểm tra dữ liệu đầu vào
        if (!foodName || !foodPrice || !foodUrl) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Lấy danh sách nguyên liệu
        const foodDetails = [];
            $("#ingredientList .ingredient-item").each(function () {
            const ingredientID = $(this).find(".ingredientID").val();
            const quantity = $(this).find(".ingredientQuantity").val();
            console.log(`Ingredient ID: ${ingredientID}, Quantity: ${quantity}`); // Kiểm tra giá trị
            if (ingredientID && quantity) {
                foodDetails.push({
                    IngredientID: ingredientID,
                    Quantity: parseFloat(quantity)
                });
            }
        });


        const foodItem = {
            FoodName: foodName,
            FoodPrice: parseFloat(foodPrice),
            ImageUrl: foodUrl,
            FoodDetails: foodDetails // Gửi danh sách nguyên liệu
        };
        console.log(foodItem);

        // Gửi yêu cầu thêm món ăn đến API
        $.ajax({
            url: 'http://localhost:5014/api/v1/FoodDetails',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(foodItem),
            success: function (response) {
                alert("Món ăn đã được thêm thành công!");
                $("#addFoodForm").hide();
                loadFoodItems();
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
        deleteFood(foodId);
    });

    // Hàm xóa món ăn
    function deleteFood(foodId) {
        if (confirm("Bạn có chắc chắn muốn xóa món ăn này?")) {
            $.ajax({
                url: 'http://localhost:5014/api/v1/FoodDetails/' + foodId,
                type: 'DELETE',
                success: function (response) {
                    alert("Món ăn đã được xóa.");
                    loadFoodItems();
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
        editFood(foodId);
    });

    // Hàm lấy thông tin món ăn và điền vào form sửa
    function editFood(foodId) {
        $.ajax({
            url: 'http://localhost:5014/api/v1/FoodDetails/' + foodId,
            type: 'GET',
            success: function (food) {
                $("#foodName").val(food.FoodName);
                $("#foodPrice").val(food.FoodPrice);
                $("#foodImage").attr("src", "../assets/img/imgfood/" + food.ImageUrl);
                $("#addFoodForm").show();
                // Cập nhật danh sách nguyên liệu
                $("#ingredientList").empty();
                food.FoodDetails.forEach(function (detail) {
                    const ingredientHtml = `
                        <div class="ingredient-item">
                            <select class="ingredientID" required>
                                <option value="${detail.IngredientId}">${detail.IngredientName}</option>
                            </select>
                            <input type="number" class="ingredientQuantity" value="${detail.Quantity}" placeholder="Số lượng" required>
                        </div>
                    `;
                    $("#ingredientList").append(ingredientHtml);
                });

                $(".btn-save").text('Cập nhật món ăn').off('click').on('click', function () {
                    updateFood(foodId);
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
        var foodImageInput = $("#foodImage")[0].files[0];
        const foodUrl = foodImageInput ? foodImageInput.name : '';

        if (foodName === "" || foodPrice === "") {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

    // Lấy danh sách nguyên liệu
        const foodDetails = [];
        $("#ingredientList .ingredient-item").each(function () {
            const ingredientID = $(this).find(".ingredientID").val(); // Lấy giá trị ID nguyên liệu
            const quantity = $(this).find(".ingredientQuantity").val(); // Lấy số lượng
            if (ingredientID && quantity) {
                foodDetails.push({
                    IngredientID: ingredientID,
                    Quantity: parseFloat(quantity) // Chuyển đổi số lượng sang số thực
                });
            }
        });


        var foodItem = {
            FoodID: foodId,
            FoodName: foodName,
            FoodPrice: parseFloat(foodPrice),
            ImageUrl: foodUrl,
            FoodDetails: foodDetails // Gửi danh sách nguyên liệu
        };

        $.ajax({
            url: 'http://localhost:5014/api/v1/FoodDetails/' + foodId,
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(foodItem),
            success: function (response) {
                alert("Món ăn đã được cập nhật.");
                loadFoodItems();
                $("#addFoodForm").hide();
            },
            error: function (error) {
                alert("Lỗi khi cập nhật món ăn.");
                console.error(error);
            }
        });
    }

    // Hàm tải danh sách nguyên liệu từ API
    function loadIngredients() {
        return new Promise((resolve, reject) => {
            $.ajax({
                url: 'http://localhost:5014/api/v1/Ingredients', // Đảm bảo URL đúng
                type: 'GET',
                dataType: 'json',
                success: function (response) {
                    var ingredientSelect = `
                        <select class="ingredientID" required>
                            <option value="">Chọn nguyên liệu</option>`;
                    response.forEach(function (ingredient) {
                        ingredientSelect += `
                            <option value="${ingredient.IngredientId}" data-unit="${ingredient.IngredientUnit}">${ingredient.IngredientName}</option>`;
                    });
                    ingredientSelect += `
                        </select>
                    `;
                    resolve(ingredientSelect); // Trả về danh sách nguyên liệu
                },
                error: function (error) {
                    console.error("Lỗi khi tải danh sách nguyên liệu.", error);
                    alert("Không thể tải danh sách nguyên liệu.");
                    reject(error);
                }
            });
        });
    }
    
    
    // Thêm nguyên liệu mớiêm nguyên liệu mới
    $("#addIngredient").on('click', function () {
        loadIngredients().then(function (ingredientSelect) {
            const ingredientHtml = `
                <div class="ingredient-item">
                    ${ingredientSelect}
                    <input type="number" class="ingredientQuantity" placeholder="Số lượng" required>
                </div>
            `;
            $("#ingredientList").append(ingredientHtml);
        }).catch(function (error) {
            console.error("Lỗi khi thêm nguyên liệu:", error);
        });
    });


    // Thay đổi placeholder cho số lượng khi chọn nguyên liệu
    $(document).on('change', '.ingredientID', function () {
        const selectedOption = $(this).find('option:selected');
        const unit = selectedOption.data('unit');
        const quantityInput = $(this).closest('.ingredient-item').find('.ingredientQuantity');
        if (unit) {
            quantityInput.attr('placeholder', `Số lượng (${unit})`);
        } else {
            quantityInput.attr('placeholder', 'Số lượng');
        }
    });
});
