$(document).ready(function() {
    let menuItems = [];
    let selectedItems = [];
    const userId = localStorage.getItem('userId');
    // Hàm load danh sách món ăn từ API
    function loadMenuItems() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods',
            type: 'GET',
            dataType: 'json',
            success: function(response) {
                menuItems = response.map(food => ({
                    id: food.FoodID,
                    name: food.FoodName,
                    price: food.FoodPrice,
                    image: food.ImageUrl ? `../assets/img/imgfood/${food.ImageUrl}` : ''
                }));
                renderMenuItems();
            },
            error: function(error) {
                console.error("Lỗi khi tải danh sách món ăn:", error);
                alert("Không thể tải danh sách món ăn.");
            }
        });
    }

    // Render danh sách món ăn
    function renderMenuItems() {
        const menuList = $('#menuList');
        menuList.empty();
        menuItems.forEach(item => {
            const menuItemHtml = `
                <div class="menu-item-card" data-id="${item.id}">
                    <img src="${item.image}" alt="${item.name}" class="menu-item-image">
                    <div class="menu-item-details">
                        <strong class="menu-item-name">${item.name}</strong>
                        <p class="menu-item-price">${item.price.toLocaleString()} đ</p>
                        <button class="add-to-cart">Thêm</button>
                    </div>
                </div>
            `;
            menuList.append(menuItemHtml);
        });
    }

    // Xử lý thêm món vào giỏ hàng
    $(document).on('click', '.add-to-cart', function() {
        const itemId = $(this).closest('.menu-item-card').data('id');
        const item = menuItems.find(i => i.id === itemId);
        
        const existingItem = selectedItems.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            selectedItems.push({...item, quantity: 1});
        }
        renderSelectedItems();
        updateCartCount();
        updateTotalAmount(); // Cập nhật tổng tiền
    });

    // Render giỏ hàng
    function renderSelectedItems() {
        const selectedItemsContainer = $('#selectedItems');
        selectedItemsContainer.empty();
        
        selectedItems.forEach(item => {
            const selectedItemHtml = `
                <div class="selected-item" data-id="${item.id}">
                    <div>
                        <strong>${item.name}</strong>
                        <p>${item.price.toLocaleString()} đ</p>
                    </div>
                    <div>
                        <button class="decrease-quantity">-</button>
                        <span>${item.quantity}</span>
                        <button class="increase-quantity">+</button>
                        <button class="remove-item">Xóa</button>
                    </div>
                </div>
            `;
            selectedItemsContainer.append(selectedItemHtml);
        });
    }

    // Cập nhật số lượng món ăn
    $(document).on('click', '.increase-quantity', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        const item = selectedItems.find(i => i.id === itemId);
        item.quantity++;
        renderSelectedItems();
        updateTotalAmount(); // Cập nhật tổng tiền
    });

    $(document).on('click', '.decrease-quantity', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        const item = selectedItems.find(i => i.id === itemId);
        if (item.quantity > 1) {
            item.quantity--;
            renderSelectedItems();
            updateTotalAmount(); // Cập nhật tổng tiền
        }
    });

    // Xóa món khỏi giỏ hàng
    $(document).on('click', '.remove-item', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        selectedItems = selectedItems.filter(i => i.id !== itemId);
        renderSelectedItems();
        updateCartCount();
        updateTotalAmount(); // Cập nhật tổng tiền
    });

    // Cập nhật số lượng món trong giỏ hàng
    function updateCartCount() {
        $('#cartCount').text(`(${selectedItems.length})`);
    }

    // Cập nhật tổng tiền
    function updateTotalAmount() {
        const totalAmount = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        $('#totalAmount').text(`${totalAmount.toLocaleString()} đ`);
    }

    // Đặt hàng
    $('#orderButton').on('click', function() {
        // Kiểm tra xem tất cả thông tin khách hàng đã được nhập
        const customerName = $('#customerName').val().trim();
        const customerEmail = $('#customerEmail').val().trim();
        const customerPhone = $('#customerPhone').val().trim();
        const customerAddress = $('#customerAddress').val().trim();

        if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
            alert('Vui lòng nhập đầy đủ thông tin khách hàng.');
            return; // Ngừng thực hiện nếu thông tin chưa đầy đủ
        }

        const orderData = {
            CustomerName: customerName,
            CustomerEmail: customerEmail,
            CustomerPhone: customerPhone,
            CustomerAddress: customerAddress,
            UserId: userId,
            OrderDetails: selectedItems.map(item => ({
                FoodId: item.id,
                Quantity: item.quantity,
                Price: item.price,
                TotalPrice: item.price * item.quantity
            }))
        };

        $.ajax({
            url: 'http://localhost:5014/api/v1/OrderOnlines',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData),
            success: function(response) {
                alert('Đặt hàng thành công!');
                // Reset giỏ hàng và thông tin khách hàng
                selectedItems = [];
                $('#customerName').val('');
                $('#customerEmail').val('');
                $('#customerPhone').val('');
                $('#customerAddress').val('');
                renderSelectedItems();
                updateCartCount();
                updateTotalAmount(); // Reset tổng tiền
                loadOrderHistory();
            },
            error: function(error) {
                console.error("Lỗi khi đặt hàng:", error);
                alert('Có lỗi xảy ra khi đặt hàng');
            }
        });
    });
    
        // Hàm load lịch sử đặt hàng
        function loadOrderHistory() {
            $.ajax({
                url: `http://localhost:5014/api/v1/OrderOnlines/user/${userId}`,
                type: 'GET',
                success: function (response) {
                    console.log(response);
                    renderOrderHistory(response);
                },
                error: function (error) {
                    console.error("Lỗi khi tải lịch sử đặt hàng:", error);
                    alert("Không thể tải lịch sử đặt hàng.");
                }
            });
        }
    
        // Render lịch sử đặt hàng
        function renderOrderHistory(orders) {
            const tableBody = $('#orderHistoryTable tbody');
            tableBody.empty();
            orders.forEach(order => {
                const isCancelable = order.Status === 'Chờ xác nhận';
                const rowHtml = `
                    <tr>
                        <td>${order.OrderonlineId}</td>
                        <td>${new Date(order.Orderdate).toLocaleString()}</td>
                        <td>${order.Totalamout.toLocaleString()} đ</td>
                        <td>${order.Status}</td>
                        <td>
                            <button class="btn-action btn-view" data-id="${order.OrderonlineId}">Xem</button>
                            <button class="btn-action btn-cancel" data-id="${order.OrderonlineId}" ${!isCancelable ? 'disabled' : ''}>Hủy</button>
                        </td>
                    </tr>
                `;
                tableBody.append(rowHtml);
            });
        }
        $(document).on('click', '.btn-view', function () {
            const orderId = $(this).data('id');
            // Gọi API lấy chi tiết đơn hàng
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
                            <p><strong>Nhân viên giao: Vũ Đức Tính</strong></p>
                            <p style="margin-left: 20px;"><strong>Số điện thoại: 0987763344</strong></p>
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
        });
        
        // Xử lý khi nhấn nút "Hủy"
        $(document).on('click', '.btn-cancel', function () {
            const orderId = $(this).data('id');
            if (confirm("Bạn có chắc muốn hủy đơn hàng này?")) {
                $.ajax({
                    url: `http://localhost:5014/api/v1/OrderOnlines/${orderId}/cancel`,
                    type: 'PUT',
                    success: function () {
                        alert("Đơn hàng đã được hủy.");
                        loadOrderHistory();
                    },
                    error: function (error) {
                        console.error("Lỗi khi hủy đơn hàng:", error);
                        alert("Không thể hủy đơn hàng.");
                    }
                });
            }
        });
    
    // Khởi tạo
    loadOrderHistory();
    // Khởi tạo
    loadMenuItems();
});
