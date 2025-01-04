$(document).ready(function () {
    // Hàm load dữ liệu danh sách đơn hàng online
    function loadOnlineOrders() {
        try {
            $('.m-loading').show(); // Hiển thị loading

            // Gọi API lấy danh sách đơn hàng online
            $.ajax({
                url: "http://localhost:5014/api/v1/OrderOnlines/filter", // Đổi URL theo API của bạn
                type: 'GET',
                dataType: 'json',
                success: function (data) {
                    console.log(data);

                    // Tổng số đơn hàng
                    const totalOrders = data.length;
                    console.log(totalOrders);

                    // Số đơn hàng "Đang chờ giao"
                    const waitingfordelivery = data.filter(order => order.Status === "Đang chuẩn bị").length;
                    console.log(waitingfordelivery);

                    // Số đơn hàng "Đang giao hàng"
                    const deliveringOrders = data.filter(order => order.Status === "Đang giao hàng").length;
                    console.log(deliveringOrders);


                    // Số đơn hàng "Đã thanh toán"
                    const paidOrders = data.filter(order => order.Status === "Đã thanh toán").length;
                    console.log(paidOrders);

                    // Hiển thị thông tin tổng số đơn hàng
                    $(".number.total").text(totalOrders);
                    $(".number.waiting").text(waitingfordelivery);
                    $(".number.delivering").text(deliveringOrders);
                    $(".number.compelete").text(paidOrders);

                    const $tableBody = $(".orders-table tbody");
                    $tableBody.empty(); // Xóa các dòng cũ nếu có

                    // Duyệt danh sách đơn hàng online và thêm vào bảng
                    data.forEach(order => {
                        const statusClass = getStatusClass(order.Status);
                        const row = `
                            <tr>
                                <td>${order.OrderonlineId}</td>
                                <td>${order.CustomerName}</td>
                                <td>${order.CustomerAddress}</td>
                                <td>
                                    <span class="order-status status-${statusClass}">${order.Status}</span>
                                </td>
                                <td class="action-buttons">
                                    <button class="btn btn-view" onclick="viewOnlineOrder('${order.OrderonlineId}')">Xem</button>
                                    <button class="btn btn-update ${order.Status === 'Đang chuẩn bị' ? '' : 'disabled'}" onclick="deliverOnlineOrder('${order.OrderonlineId}')">Giao Hàng</button>
                                    <button class="btn btn-completed ${order.Status === 'Đang giao hàng' ? '' : 'disabled'}" onclick="markOnlineOrderAsDelivered('${order.OrderonlineId}')">Đã Giao</button>
                                </td>
                            </tr>
                        `;
                        $tableBody.append(row);
                    });

                    $('.m-loading').hide(); // Ẩn loading
                },
                error: function (error) {
                    console.error("Lỗi khi tải đơn hàng online:", error);
                    $('.m-loading').hide(); // Ẩn loading khi gặp lỗi
                }
            });
        } catch (error) {
            console.error("Lỗi:", error);
            $('.m-loading').hide(); // Ẩn loading khi gặp lỗi
        }
    }

    // Hàm lấy class trạng thái đơn hàng online
    function getStatusClass(status) {
        switch (status) {
            case 'Chờ xác nhận': return 'pending';
            case 'Đang chuẩn bị': return 'processing';
            case 'Đang giao hàng': return 'delivering';
            case 'Đã thanh toán': return 'completed';
            case 'Đã hủy': return 'cancelled';
            default: return '';
        }
    }
    // Hàm xử lý hành động "Xem"
    window.viewOnlineOrder = function(orderOnlineId) {
        // Lấy thông tin chi tiết đơn hàng từ API
        $.ajax({
            url: `http://localhost:5014/api/v1/OrderOnlines/${orderOnlineId}`,
            type: 'GET',
            success: function (order) {
                // Tạo danh sách các món ăn
                let foodDetails = '';
                order.Foods.forEach(food => {
                    foodDetails += `
                        <tr>
                            <td>${food.FoodName}</td>
                            <td>${food.Quantity}</td>
                            <td>${food.Price.toLocaleString()} đ</td>
                        </tr>
                    `;
                });
                const estimatedDeliveryTime = new Date(order.Orderdate);
                estimatedDeliveryTime.setHours(estimatedDeliveryTime.getHours() + 1);
                // Gán thông tin vào modal
                const modalContent = `
                    <span class="close-btn">&times;</span>
                    <h2>Chi tiết đơn hàng</h2>
                    <div style="display: flex; align-items: center;">
                        <p><strong>Nhân viên giao: Nguyễn Đăng Văn</strong></p>
                        <p style="margin-left: 20px;"><strong>Số điện thoại: 0978663345</strong></p>
                    </div>
                    <h3>Thông tin khách hàng:</h3>
                    <p><strong>Tên:</strong> ${order.CustomerName}</p>
                    <p><strong>Email:</strong> ${order.CustomerEmail}</p>
                    <p><strong>Địa chỉ:</strong> ${order.CustomerAddress}</p>
                    <p><strong>Số điện thoại:</strong> ${order.CustomerPhone}</p>
                    <p><strong>Thời gian đặt:</strong> ${new Date(order.Orderdate).toLocaleString()}</p>
                    <p><strong>Thời gian giao dự kiến:</strong> ${estimatedDeliveryTime.toLocaleString()}</p>
                    <h4>Danh sách món ăn</h4>
                    <table class="order-table">
                        <thead>
                            <tr>
                                <th>Tên món</th>
                                <th>Số lượng</th>
                                <th>Giá</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${foodDetails}
                        </tbody>
                    </table>
                    <p class="total-amount"><strong>Tổng tiền:</strong> ${order.TotalAmount.toLocaleString()} đ</p>
                `;
                $('.modal-content').html(modalContent);
    
                // Hiển thị modal
                $('.modal').fadeIn();
    
                // Sự kiện đóng modal
                $('.close-btn').on('click', function () {
                    $('.modal').fadeOut();
                });
            },
            error: function (error) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", error);
                alert("Không thể tải chi tiết đơn hàng.");
            }
        });
    };
    // Hàm xử lý hành động "Giao hàng"
    window.deliverOnlineOrder = function (orderOnlineId) {
        if (confirm(`Bạn có chắc muốn giao đơn hàng ${orderOnlineId}?`)) {
            $.ajax({
                url: `http://localhost:5014/api/v1/OrderOnlines/${orderOnlineId}/deliver`, // API cập nhật trạng thái
                type: 'PUT',
                success: function () {
                    alert("Đơn hàng online đã chuyển sang trạng thái Đang Giao.");
                    loadOnlineOrders(); // Tải lại danh sách đơn hàng online
                },
                error: function (error) {
                    console.error("Lỗi khi giao đơn hàng online:", error);
                    alert("Không thể giao đơn hàng này");
                }
            });
        }
    };

    // Hàm xử lý hành động "Đã Giao"
    window.markOnlineOrderAsDelivered = function (orderOnlineId) {
        if (confirm(`Bạn có chắc muốn đánh dấu đơn hàng online ${orderOnlineId} là Đã Giao?`)) {
            $.ajax({
                url: `http://localhost:5014/api/v1/OrderOnlines/${orderOnlineId}/complete`, // API cập nhật trạng thái
                type: 'PUT',
                success: function () {
                    alert("Đơn hàng online đã chuyển sang trạng thái Đã Giao.");
                    loadOnlineOrders(); // Tải lại danh sách đơn hàng online
                },
                error: function (error) {
                    console.error("Lỗi khi cập nhật đơn hàng online:", error);
                    alert("Đơn hàng đã hoàn thành hoặc chưa được giao");
                }
            });
        }
    };

    // Gọi hàm loadOnlineOrders khi trang được tải
    loadOnlineOrders();
});
