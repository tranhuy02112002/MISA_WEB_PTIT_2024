$(document).ready(function() {
    var ingredientid;
    // Hàm load danh sách nguyên liệu
    function loadIngredients() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Ingredients',
            method: 'GET',
            success: function(ingredients) {
                renderIngredients(ingredients);
            },
            error: function(xhr) {
                alert('Lỗi tải danh sách nguyên liệu: ' + xhr.responseText);
            }
        });
    }

    // Render danh sách nguyên liệu
    function renderIngredients(ingredients) {
        const tableBody = $('#ingredientTableBody');
        tableBody.empty();
        console.log(ingredients);

        ingredients.forEach(ing => {
            const row = `
                <tr>
                    <td>${ing.IngredientId}</td>
                    <td>${ing.IngredientName}</td>
                    <td>${ing.IngredientType}</td>
                    <td>${ing.IngredientQuantity}</td>
                    <td>${ing.IngredientUnit}</td>
                    <td>${formatDate(ing.IngredientExpired)}</td>
                    <td>${ing.IngredientStatus}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-edit" data-id="${ing.IngredientId}">Sửa</button>
                            <button class="btn-delete" data-id="${ing.IngredientId}">Xóa</button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    // Format ngày tháng
    function formatDate(dateString) {
        if (!dateString) return 'Chưa xác định';
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    // Hiển thị modal thêm nguyên liệu
    $('#addIngredientBtn').click(function() {
        resetForm();
        $('#ingredientModal').show();
        $('#modalTitle').text('Thêm Nguyên Liệu Mới');
        $('#submitIngredientBtn').text('Thêm Nguyên Liệu').data('mode', 'add');
        enableFormInputs();
    });

    // Đóng modal
    $('.close-btn').click(function() {
        $('#ingredientModal').hide();
    });

    // Xử lý form thêm nguyên liệu
    function handleAddIngredient(ingredient) {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Ingredients',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(ingredient),
            success: function() {
                alert("Nguyên liệu đã được thêm.");
                $('#ingredientModal').hide();
                loadIngredients();
                resetForm();
            },
            error: function(xhr) {
                alert('Lỗi thêm: ' + xhr.responseText);
            }
        });
    }

    // Xử lý form sửa nguyên liệu
    function handleUpdateIngredient(ingredientupdate) {
        console.log(ingredientupdate);
        $.ajax({
            url: `http://localhost:5014/api/v1/Ingredients/${ingredientupdate.IngredientId}`,
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(ingredientupdate),
            success: function() {
                $('#ingredientModal').hide();
                alert("Nguyên liệu đã được cập nhật.");
                loadIngredients();
                resetForm();
                $('#submitIngredientBtn').text('Thêm Nguyên Liệu').data('mode', 'add');
                enableFormInputs();
            },
            error: function(xhr) {
                alert('Lỗi sửa: ' + xhr.responseText);
            }
        });
    }

    // Xử lý submit form
    $('#ingredientForm').submit(function(e) {
        e.preventDefault();
        // Chuẩn bị dữ liệu
        const ingredient = {
            IngredientName: $('#ingredientName').val(),
            IngredientType: $('#ingredientCategory').val(),
            IngredientQuantity: parseFloat($('#ingredientQuantity').val()),
            IngredientUnit: $('#ingredientUnit').val(),
            IngredientExpired: $('#ingredientExpiry').val() ? new Date($('#ingredientExpiry').val()) : null,
            IngredientStatus: 'Còn Hạn' // Thêm trạng thái mặc định
        };
        const ingredientupdate = {
            IngredientId: ingredientid,
            IngredientName: $('#ingredientName').val(),
            IngredientType: $('#ingredientCategory').val(),
            IngredientQuantity: parseFloat($('#ingredientQuantity').val()),
            IngredientUnit: $('#ingredientUnit').val(),
            IngredientExpired: $('#ingredientExpiry').val() ? new Date($('#ingredientExpiry').val()) : null,
            IngredientStatus: 'Còn Hạn' // Thêm trạng thái mặc định
        };
        // Kiểm tra chế độ (thêm hoặc sửa)
        const mode = $('#submitIngredientBtn').data('mode');
        if (mode === 'add') {
            handleAddIngredient(ingredient);
        } else if (mode === 'edit') {
            handleUpdateIngredient(ingredientupdate);
        }
    });

    // Sự kiện sửa nguyên liệu
    $(document).on('click', '.btn-edit', function() {
        ingredientid = $(this).data('id');
        // Gọi API lấy chi tiết nguyên liệu
        $.ajax({
            url: `http://localhost:5014/api/v1/Ingredients/${ingredientid}`,
            method: 'GET',
            success: function(ingredient) {
                // Điền thông tin vào form
                $('#ingredientName').val(ingredient.IngredientName);
                $('#ingredientCategory').val(ingredient.IngredientType);
                $('#ingredientQuantity').val(ingredient.IngredientQuantity);
                $('#ingredientUnit').val(ingredient.IngredientUnit);
                $('#ingredientExpiry').val(formatInputDate(ingredient.IngredientExpired));
                $('#ingredientModal').show();
                $('#modalTitle').text('Chỉnh Sửa Nguyên Liệu');
                $('#submitIngredientBtn').text('Xác Nhận Sửa').data('mode', 'edit');
                // Tùy chọn: Disable các trường không muốn sửa
                // disableFormInputs();
            },
            error: function(xhr) {
                alert('Lỗi: ' + xhr.responseText);
            }
        });
    });

    // Hàm disable các input nếu cần
    function disableFormInputs() {
        // Ví dụ: $('#ingredientName').prop('disabled', true);
    }

    // Hàm enable các input
    function enableFormInputs() {
        // Ví dụ: $('#ingredientName').prop('disabled', false);
    }

    // Các phần code còn lại giữ nguyên...

    // Sự kiện xóa nguyên liệu
    $(document).on('click', '.btn-delete', function() {
        const id = $(this).data('id');
        
        if(confirm('Bạn có chắc muốn xóa nguyên liệu này?')) {
            $.ajax({
                url: `http://localhost:5014/api/v1/Ingredients/${id}`,
                method: 'DELETE',
                success: function() {
                    alert("Nguyên liệu đã được xóa.");
                    loadIngredients();
                },
                error: function(xhr) {
                    alert('Lỗi: ' + xhr.responseText);
                }
            });
        }
    });

    // Format ngày cho input date
    function formatInputDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        const localDate = new Date(date.getTime() - (offset * 60000));
        return localDate.toISOString().split('T')[0];
    }
    

    // Reset form
    function resetForm() {
        $('#ingredientForm')[0].reset();
        $('#ingredientId').val('');
    }

    // Load danh sách nguyên liệu khi trang được tải
    loadIngredients();
});
