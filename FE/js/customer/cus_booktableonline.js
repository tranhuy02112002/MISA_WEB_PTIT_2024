$(document).ready(function () {
    const userId = localStorage.getItem('userId');
    const username = localStorage.getItem('username');

    if (!userId) {
        alert('Vui lòng đăng nhập');
        window.location.href = 'loginout.html';
        return;
    }
;

    const today = new Date();
    const minDate = today.toISOString().split('T')[0] + 'T00:00';
    $('#bookDate').attr('min', minDate);

    // Biến lưu bookTableId đang được chỉnh sửa
    let currentEditBookTableId = null;

    // Xử lý đặt bàn
    $('#saveBooktableBtn').on('click', function() {
        const customerName = $('#customerName').val().trim();
        const customerPhone = $('#customerPhone').val().trim();
        const customerEmail = $('#customerEmail').val().trim();
        const bookDate = $('#bookDate').val();
        const guestCount = $('#guestCount').val();

        if (!customerName || !customerPhone || !bookDate || !guestCount) {
            alert('Vui lòng nhập đầy đủ thông tin');
            return;
        }

        const bookTableData = {
            CustomerId: userId,
            CustomerName: customerName,
            CustomerPhone: customerPhone,
            CustomerEmail: customerEmail,
            BookDate: bookDate,
            GuestCount: parseInt(guestCount)
        };

        // Kiểm tra xem đang thực hiện thêm mới hay chỉnh sửa
        if (currentEditBookTableId) {
            // Chỉnh sửa đơn đặt bàn
            $.ajax({
                url: `http://localhost:5014/api/v1/BookTables/update/${currentEditBookTableId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(bookTableData),
                success: function(response) {
                    alert('Cập nhật đặt bàn thành công!');
                    loadCustomerBooktables();
                    resetForm();
                    currentEditBookTableId = null;
                    $('#saveBooktableBtn').text('Đặt Bàn');
                },
                error: function(xhr) {
                    alert('Lỗi cập nhật đặt bàn: ' + (xhr.responseJSON?.message || 'Không xác định'));
                }
            });
        } else {
            // Tạo mới đơn đặt bàn
            $.ajax({
                url: 'http://localhost:5014/api/v1/BookTables/create',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(bookTableData),
                success: function(response) {
                    alert('Đặt bàn thành công!');
                    loadCustomerBooktables();
                    resetForm();
                },
                error: function(xhr) {
                    alert('Lỗi đặt bàn: ' + (xhr.responseJSON?.message || 'Không xác định'));
                }
            });
        }
    });

    // Hàm tải danh sách đặt bàn của khách hàng
    function loadCustomerBooktables() {
        $.ajax({
            url: `http://localhost:5014/api/v1/BookTables/customer/${userId}`,
            type: 'GET',
            success: function(bookTables) {
                const tableBody = $('#booktableList tbody');
                tableBody.empty();
                bookTables.sort((a, b) => new Date(b.Bookdate) - new Date(a.Bookdate));
                bookTables.forEach(function(booking) {
                    const row = `
                        <tr>
                            <td>${new Date(booking.Bookdate).toLocaleString()}</td>
                            <td>${booking.GuestCount}</td>
                            <td>${booking.TableNumber || 'Chưa xác định'}</td>
                            <td>${getBookingStatus(booking.Status)}</td>
                            <td>
                                ${booking.Status === 0 ? `
                                    <button class="edit-booking" 
                                        data-id="${booking.BooktableId}"
                                        data-name="${booking.CustomerName}"
                                        data-phone="${booking.CustomerPhone}"
                                        data-email="${booking.CustomerEmail}"
                                        data-date="${formatDateForInput(booking.Bookdate)}"
                                        data-guests="${booking.GuestCount}">
                                        Sửa
                                    </button>
                                    <button class="cancel-booking" data-id="${booking.BooktableId}">Hủy</button>
                                ` : 'Đã hoàn thành'}
                            </td>
                        </tr>
                    `;
                    tableBody.append(row);
                });
            },
            error: function(xhr) {
                console.error('Lỗi tải danh sách đặt bàn', xhr);
            }
        });
    }

    // Hàm format ngày để điền vào input
    function formatDateForInput(dateString) {
        const date = new Date(dateString);
        const formattedDate = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
        return formattedDate;
    }

    // Xử lý sự kiện nút Sửa
    $(document).on('click', '.edit-booking', function() {
        currentEditBookTableId = $(this).data('id');
        
        $('#customerName').val($(this).data('name'));
        $('#customerPhone').val($(this).data('phone'));
        $('#customerEmail').val($(this).data('email'));
        $('#bookDate').val($(this).data('date'));
        $('#guestCount').val($(this).data('guests'));
        
        $('#saveBooktableBtn').text('Cập Nhật');
    });

    // Hàm chuyển đổi trạng thái đặt bàn
    function getBookingStatus(status) {
        switch(status) {
            case 0: return 'Chờ duyệt';
            case 1: return 'Đã duyệt';
            case 2: return 'Đã hủy';
            default: return 'Không xác định';
        }
    }

    // Hàm reset form
    function resetForm() {
        $('#customerName').val('');
        $('#customerPhone').val('');
        $('#customerEmail').val('');
        $('#bookDate').val('');
        $('#guestCount').val('1');
        $('#saveBooktableBtn').text('Đặt Bàn');
        currentEditBookTableId = null;
    }

    // Xử lý hủy đặt bàn
    $(document).on('click', '.cancel-booking', function() {
        const bookTableId = $(this).data('id');
        console.log(bookTableId);
        if (confirm('Bạn chắc chắn muốn hủy đặt bàn này?')) {
            $.ajax({
                url: `http://localhost:5014/api/v1/BookTables/cancel/${bookTableId}`,
                type: 'PUT',
                success: function(response) {
                    alert('Hủy đặt bàn thành công');
                    loadCustomerBooktables();
                },
                error: function(xhr) {
                    alert('Lỗi hủy đặt bàn: ' + (xhr.responseJSON?.message || 'Không xác định'));
                }
            });
        }
    });

    // Tải danh sách đặt bàn khi trang được load
    loadCustomerBooktables();
});
