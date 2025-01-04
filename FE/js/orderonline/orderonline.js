$(document).ready(function () {
    // Lấy tất cả các đơn hàng khi trang được tải
    function fetchOrders() {
        $(".m-loading").show(); // Hiển thị loading
        $.ajax({
            url: 'http://localhost:5014/api/v1/orderonlines',  // Địa chỉ API của bạn
            method: 'GET',
            success: function (data) {
                $(".m-loading").hide(); // Ẩn loading
                renderOrders(data);  // Gọi hàm render dữ liệu vào bảng
            },
            error: function () {
                $(".m-loading").hide();
                alert('Có lỗi xảy ra khi tải đơn hàng.');
            }
        });
    }

    // Hiển thị danh sách đơn hàng vào bảng
    function renderOrders(orders) {
        const orderTableBody = $('#orderTableBody');
        orderTableBody.empty(); // Xóa hết dữ liệu cũ

        orders.forEach(order => {
            const orderRow = `
                <tr>
                    <td>${order.OrderonlineId}</td>
                    <td>${order.CustomerName}</td>
                    <td>${order.CustomerPhone}</td>
                    <td>${order.Totalamout}</td>
                    <td>${new Date(order.Orderdate).toLocaleString()}</td>
                    <td>
                        <span class="order-status status-${getStatusClass(order.Status)}">
                            ${order.Status}
                        </span>
                    </td>
                    <td>
                        <div class="order-action-btns">
                            <button class="btn-view" onclick="viewOrder('${order.OrderonlineId}')">Xem</button>
                             <button class="btn-update ${order.Status === 'Chờ xác nhận' ? '' : 'disabled'}" 
                                onclick="approveOrder('${order.OrderonlineId}')"
                                >
                                Duyệt
                            </button>
                            <button class="btn-update ${order.Status === 'Đã hủy'||order.Status === 'Đã thanh toán'|| order.Status === 'Đang giao hàng' ? 'disabled' : ''}" onclick="cancelOrder('${order.OrderonlineId}')">Hủy</button>
                        </div>
                    </td>
                </tr>
            `;
            orderTableBody.append(orderRow);
        });
    }

    // Lấy class status cho mỗi trạng thái
    function getStatusClass(status) {
        switch (status) {
            case 'Chờ xác nhận': return 'pending';
            case 'Đang chuẩn bị': return 'processing';
            case 'Đang giao': return 'delivering';
            case 'Đã thanh toán': return 'completed';
            case 'Đã hủy': return 'cancelled';
            default: return '';
        }
    }

    // Xem chi tiết đơn hàng trong modal
    window.viewOrder = function (orderId) {
        // Lấy thông tin chi tiết đơn hàng từ API
        $.ajax({
            url: `http://localhost:5014/api/v1/OrderOnlines/${orderId}`,
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

    // Duyệt đơn hàng
    window.approveOrder = function (orderId) {
        $.ajax({
            url: `http://localhost:5014/api/v1/orderonlines/${orderId}/approve`,
            method: 'PUT',
            success: function () {
                alert('Đơn hàng đã được duyệt.');
                fetchOrders();  // Làm mới danh sách đơn hàng
            },
            error: function () {
                alert('Không thể duyệt đơn hàng.');
            }
        });
    };

    // Hủy đơn hàng
    window.cancelOrder = function (orderId) {
        $.ajax({
            url: `http://localhost:5014/api/v1/orderonlines/${orderId}/cancel`,
            method: 'PUT',
            success: function () {
                alert('Đơn hàng đã bị hủy.');
                fetchOrders();  // Làm mới danh sách đơn hàng
            },
            error: function () {
                alert('Không thể hủy đơn hàng.');
            }
        });
    };

    // Thực hiện tải dữ liệu đơn hàng khi trang được tải
    fetchOrders();

    // Đóng modal khi nhấn nút đóng
    $('.close-btn').on('click', function() {
        $('#orderDetailsModal').hide();
    });

    // Đóng modal nếu nhấn ra ngoài modal
    $(window).on('click', function(event) {
        if ($(event.target).is('#orderDetailsModal')) {
            $('#orderDetailsModal').hide();
        }
    });
});
