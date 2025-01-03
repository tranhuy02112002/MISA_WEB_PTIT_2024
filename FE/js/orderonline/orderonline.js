$(document).ready(function() {
    // Danh sách đơn hàng mẫu
    const orders = [
        {
            id: 'ODH001',
            customer: 'Nguyễn Văn A',
            phone: '0912345678',
            total: 250000,
            date: '2024-02-15',
            status: 'pending'
        },
        // Thêm các đơn hàng khác
    ];

    function renderOrders(filteredOrders = orders) {
        const tableBody = $('#orderTableBody');
        tableBody.empty();

        filteredOrders.forEach(order => {
            const row = `
                <tr>
                    <td>${order.id}</td>
                    <td>${order.customer}</td>
                    <td>${order.phone}</td>
                    <td>${order.total.toLocaleString()}đ</td>
                    <td>${order.date}</td>
                    <td>
                        <span class="order-status status-${order.status}">
                            ${getStatusLabel(order.status)}
                        </span>
                    </td>
                    <td>
                        <div class="order-action-btns">
                            <button class="btn-view" onclick="viewOrderDetail('${order.id}')">Xem</button>
                            <button class="btn-update" onclick="updateOrderStatus('${order.id}')">Cập nhật</button>
                        </div>
                    </td>
                </tr>
            `;
            tableBody.append(row);
        });
    }

    function getStatusLabel(status) {
        const statusLabels = {
            'pending': 'Chờ xác nhận',
            'processing': 'Đang chuẩn bị',
            'delivering': 'Đang giao',
            'completed': 'Hoàn thành',
            'cancelled': 'Đã hủy'
        };
        return statusLabels[status] || status;
    }

    // Các hàm xử lý sự kiện
    window.viewOrderDetail = function(orderId) {
        // Logic hiển thị chi tiết đơn hàng
        $('#orderDetailModal').show();
    }

    window.updateOrderStatus = function(orderId) {
        // Logic cập nhật trạng thái đơn hàng
    }

    $('#orderStatusFilter').change(function() {
        const status = $(this).val();
        const filteredOrders = status 
            ? orders.filter(order => order.status === status)
            : orders;
        renderOrders(filteredOrders);
    });

    $('#orderSearchInput').on('keyup', function() {
        const searchTerm = $(this).val().toLowerCase();
        const filteredOrders = orders.filter(order => 
            order.customer.toLowerCase().includes(searchTerm) ||
            order.id.toLowerCase().includes(searchTerm)
        );
        renderOrders(filteredOrders);
    });

    // Khởi tạo ban đầu
    renderOrders();
});
