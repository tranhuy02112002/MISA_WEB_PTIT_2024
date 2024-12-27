$(document).ready(function () {
    console.log($('.tr_color').css('background-color'))
    // Load danh sách hóa đơn
    function loadBills() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Orders/all',
            type: 'GET',
            success: function (response) {
                const billTableBody = $('#billTable tbody');
                billTableBody.empty();

                response.forEach(bill => {
                    const row = `
                        <tr data-id="${bill.OrderID}" class="bill-row">
                            <td>${bill.OrderID}</td>
                            <td>${bill.CustomerName}</td>
                            <td>${bill.TotalAmount.toLocaleString()} đ</td>
                            <td>${bill.Status}</td>
                            <td>${new Date(bill.EntryTime).toLocaleString()}</td>
                            <td>${bill.PaymentTime ? new Date(bill.PaymentTime).toLocaleString() : 'Chưa thanh toán'}</td>
                        </tr>
                    `;
                    billTableBody.append(row);
                });
            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách hóa đơn:", error);
            }
        });
    }

    // Hiển thị chi tiết hóa đơn
    $(document).on('click', '.bill-row', function () {
        const orderId = $(this).data('id');

        $.ajax({
            url: `http://localhost:5014/api/v1/Orders/${orderId}`,
            type: 'GET',
            success: function (response) {
                const billDetails = $('#billDetails');
                billDetails.empty();

                let html = `
                    <p><strong>Mã hóa đơn:</strong> ${response.OrderID}</p>
                    <p><strong>Khách hàng:</strong> ${response.CustomerName}</p>
                    <p><strong>Số điện thoại:</strong> ${response.CustomerPhone}</p>
                    <p><strong>Email:</strong> ${response.CustomerEmail}</p>
                    <p><strong>Bàn số:</strong> ${response.TableNumber}</p> <!-- Hiển thị số bàn ăn -->
                    <p><strong>Giờ vào:</strong> ${new Date(response.EntryTime).toLocaleString()}</p>
                    <p><strong>Giờ thanh toán:</strong> ${response.PaymentTime ? new Date(response.PaymentTime).toLocaleString() : 'Chưa thanh toán'}</p>
                    <p><strong>Trạng thái:</strong> ${response.Status}</p>
                    <p><strong>Danh sách món:</strong></p>
                    <ul>
                `;
                JSON.parse(response.OrderDetails).forEach(item => {
                    html += `
                        <li>${item.FoodName} - Số lượng: ${item.Quantity} - Giá: ${item.Price.toLocaleString()} đ - Thành tiền: ${item.TotalPrice.toLocaleString()} đ</li>
                    `;
                });
                html += `
                    </ul>
                    <p><strong>Tổng tiền:</strong> ${response.TotalAmount.toLocaleString()} đ</p>
                    <p><strong>Giảm giá:</strong> ${response.DiscountPercentage}%</p>
                `;

                billDetails.html(html);
                $('#billDetailsModal').fadeIn(); // Hiển thị modal với hiệu ứng fade-in
            },
            error: function (error) {
                console.error("Lỗi khi tải chi tiết hóa đơn:", error);
            }
        });
    });

    // Đóng modal chi tiết hóa đơn khi nhấn nút X
    $('#closeBillDetailsModal').on('click', function () {
        $('#billDetailsModal').fadeOut(); // Ẩn modal với hiệu ứng fade-out
    });

    // Đóng modal khi nhấn bên ngoài nội dung modal
    $(window).on('click', function (event) {
        if ($(event.target).is('#billDetailsModal')) {
            $('#billDetailsModal').fadeOut();
        }
    });

    // Khởi tạo
    loadBills();
});
