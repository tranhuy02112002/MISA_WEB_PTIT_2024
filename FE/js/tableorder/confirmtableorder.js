$(document).ready(function () {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0] + 'T00:00';
    $('#bookDate').attr('min', minDate);

    // Load danh sách bàn
    function loadAvailableTables() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Booktables/available',
            type: 'GET',
            success: function (tables) {
                console.log(tables);
                const tableSelect = $('#tableSelect');
                tableSelect.empty();
                
                // Sắp xếp bàn theo số bàn tăng dần
                const sortedTables = tables.sort((a, b) => {
                    // Chuyển số bàn thành số để so sánh đúng
                    const tableNumberA = parseInt(a.TableNumber);
                    const tableNumberB = parseInt(b.TableNumber);
                    return tableNumberA - tableNumberB;
                });

                sortedTables.forEach(table => {
                    tableSelect.append(`<option value="${table.TableId}">Bàn số: ${table.TableNumber} - Số chỗ: ${table.Seats}</option>`);
                });
            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách bàn:", error);
            }
        });
    }

    // Load danh sách đặt bàn
    function loadBooktables() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Booktables',
            type: 'GET',
            success: function (booktables) {
                const tableBody = $('#booktableList tbody');
                tableBody.empty();

                // Sắp xếp booktables theo thời gian (từ gần nhất đến xa nhất)
                booktables.sort((a, b) => new Date(b.Bookdate) - new Date(a.Bookdate));

                booktables.forEach(booktable => {
                    const row = `
                        <tr data-id="${booktable.BooktableId}">
                            <td>${booktable.CustomerName}</td>
                            <td>${booktable.CustomerPhone}</td>
                            <td>${booktable.CustomerEmail}</td>
                            <td>${new Date(booktable.Bookdate).toLocaleString()}</td>
                            <td>${booktable.GuestCount}</td>
                            <td>${booktable.TableNumber}</td>
                            <td>
                                ${booktable.Status === 0 ? 'Chưa duyệt' : 
                                (booktable.Status === 1 ? 'Đã duyệt' : 
                                (booktable.Status === 2 ? 'Đã hủy' : 'Trạng thái không xác định'))}
                            </td>

                            <td>
                                <button class="action-btn approve-btn ${booktable.Status === 1 || booktable.Status === 2 ? 'disabled' : ''}">
                                    <i class="fas fa-check"></i>Duyệt
                                </button>
                                <button class="edit-btn">Sửa</button>
                                <button class="delete-btn">Xóa</button>
                            </td>
                        </tr>
                    `;
                    tableBody.append(row);
                });
            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách đặt bàn:", error);
            }
        });
    }
    
     // Sửa đặt bàn
     $(document).on('click', '.edit-btn', function () {
        const row = $(this).closest('tr');
        const bookTableId = row.data('id');

        // Lấy thông tin đặt bàn
        $.ajax({
            url: `http://localhost:5014/api/v1/Booktables/${bookTableId}`,
            type: 'GET',
            success: function (booktable) {
                // Điền thông tin vào form
                $('#customerName').val(booktable.CustomerName);
                $('#customerPhone').val(booktable.CustomerPhone);
                $('#customerEmail').val(booktable.CustomerEmail);
                
                // Chuyển đổi ngày thành định dạng datetime-local
                const bookDate = new Date(booktable.Bookdate);
                const formattedDate = new Date(bookDate.getTime() - bookDate.getTimezoneOffset() * 60000)
                .toISOString()
                .slice(0, 16);
                $('#bookDate').val(formattedDate);
                $('#guestCount').val(booktable.GuestCount);
                $('#tableSelect').val(booktable.TableId);

                // Lưu ID để cập nhật
                $('#saveBooktableBtn').data('edit-id', bookTableId);
                $('#saveBooktableBtn').text('Cập nhật');
            },
            error: function (error) {
                console.error("Lỗi khi lấy thông tin đặt bàn:", error);
            }
        });
    });

    // Xử lý nút lưu (thêm hoặc sửa)
    $('#saveBooktableBtn').on('click', function () {
        const editId = $(this).data('edit-id');
        console.log(editId);
        const booktableData = {
            CustomerName: $('#customerName').val(),
            CustomerPhone: $('#customerPhone').val(),
            CustomerEmail: $('#customerEmail').val(),
            Bookdate: $('#bookDate').val(),
            GuestCount: $('#guestCount').val(),
            TableId: $('#tableSelect').val()
        };
        
        if (editId) {
            // Sửa đặt bàn
            $.ajax({
                url: `http://localhost:5014/api/v1/Booktables/${editId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(booktableData),
                success: function () {
                    alert('Cập nhật đặt bàn thành công!');
                    loadBooktables();
                    // Reset form và nút
                    $('#saveBooktableBtn').removeData('edit-id');
                    $('#saveBooktableBtn').text('Lưu');
                    $('#booktableForm')[0].reset();
                },
                error: function (error) {
                    alert('Bàn đã được đặt trong thời gian này!');
                }
            });
        } else {
            // Thêm đặt bàn mới
            $.ajax({
                url: 'http://localhost:5014/api/v1/Booktables',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(booktableData),
                success: function () {
                    alert('Thêm đặt bàn thành công!');
                    loadBooktables();
                    $('#booktableForm')[0].reset();
                },
                error: function (error) {
                    alert('Bàn đã được đặt trong thời gian này!');
                }
            });
        }
    });

    // Xóa đặt bàn
    $(document).on('click', '.delete-btn', function () {
        const row = $(this).closest('tr');
        const bookTableId = row.data('id');

        if (confirm('Bạn có chắc chắn muốn xóa đặt bàn này?')) {
            $.ajax({
                url: `http://localhost:5014/api/v1/Booktables/${bookTableId}`,
                type: 'DELETE',
                success: function () {
                    alert('Xóa đặt bàn thành công!');
                    loadBooktables();
                },
                error: function (error) {
                    console.error("Lỗi khi xóa đặt bàn:", error);
                    alert('Không thể xóa đặt bàn này!');
                }
            });
        }
    });

    // Duyệt đặt bàn
    $(document).on('click', '.approve-btn:not(.disabled)', function () {
        const row = $(this).closest('tr');
        const bookTableId = row.data('id');

        $.ajax({
            url: `http://localhost:5014/api/v1/Booktables/${bookTableId}/approve`,
            type: 'PATCH',
            success: function () {
                alert('Duyệt đặt bàn thành công!');
                loadBooktables();
            },
            error: function (error) {
                console.error("Lỗi khi duyệt đặt bàn:", error);
                alert('Không thể duyệt đặt bàn này!');
            }
        });
    });

    // Khởi tạo
    loadAvailableTables();
    loadBooktables();
});
