$(document).ready(function() {
    // Biến lưu trữ danh sách món ăn
    let menuItems = [];
    let currentTableId = localStorage.getItem('selectedTableId');
    let currentOrderId = null;
    let dateTime = null;
    console.log(currentTableId);

    // Hàm load danh sách món ăn từ API
    function loadMenuItemsFromAPI() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Foods', 
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                currentOrderId = response.OrderID; // Lưu OrderID
                dateTime = response.CreatedDate;
                // Lưu danh sách món ăn
                menuItems = response.map(food => ({
                    id: food.FoodID,
                    name: food.FoodName,
                    price: food.FoodPrice,
                    image: food.ImageUrl ? `../assets/img/imgfood/${food.ImageUrl}` : ''
                }));                
                // Render danh sách món ăn
                renderMenuItems();
            },
            error: function (error) {
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
                    <div>
                        <img src="${item.image}" alt="${item.name}" style="max-width: 100px; max-height: 100px;">
                        <strong>${item.name}</strong>
                        <p>${item.price.toLocaleString()} đ</p>
                    </div>
                    <button class="add-to-order">Thêm</button>
                </div>
            `;
            menuList.append(menuItemHtml);
        });
    }

    // Danh sách các món đã chọn
    let selectedItems = [];

    // Xử lý thêm món
    $(document).on('click', '.add-to-order', function() {
        const customerName = $('#customerName').val();
        const customerPhone = $('#customerPhone').val();
        
        if (!customerName || !customerPhone) {
            alert('Vui lòng nhập thông tin khách hàng');
            return;
        }
        const itemId = $(this).closest('.menu-item-card').data('id');
        const item = menuItems.find(i => i.id === itemId);
        
        const existingItem = selectedItems.find(i => i.id === itemId);
        if (existingItem) {
            existingItem.quantity++;
        } else {
            selectedItems.push({...item, quantity: 1});
        }
        saveOrderToAPI();
        renderSelectedItems();
        updatePaymentDetails();
    });

    // Render các món đã chọn
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

    // Tăng giảm số lượng
    $(document).on('click', '.increase-quantity', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        const item = selectedItems.find(i => i.id === itemId);
        item.quantity++;
        renderSelectedItems();
        updatePaymentDetails();
        saveOrderToAPI();
    });

    $(document).on('click', '.decrease-quantity', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        const item = selectedItems.find(i => i.id === itemId);
        if (item.quantity > 1) {
            item.quantity--;
            renderSelectedItems();
            updatePaymentDetails();
            saveOrderToAPI();
        }
    });

    // Xóa món
    $(document).on('click', '.remove-item', function() {
        const itemId = $(this).closest('.selected-item').data('id');
        selectedItems = selectedItems.filter(i => i.id !== itemId);
        renderSelectedItems();
        updatePaymentDetails();
        saveOrderToAPI();
    });

    // Cập nhật thông tin thanh toán
    function updatePaymentDetails() {
        if (!currentOrderId) {
            // Mã hóa đơn
            $('#billCode').text('ĐH-');
        
            // Giờ vào
            $('#entryTime').text(new Date().toLocaleTimeString());
        } else {
            // Nếu có currentOrderId, hiển thị thời gian order và ID đơn hàng
            $('#billCode').text('ĐH-' + currentOrderId);
            
            // Giả sử bạn có một thuộc tính orderTime lưu thời gian order
            $('#entryTime').text(dateTime);
        }
        
        // Tổng số lượng
        const totalItems = selectedItems.reduce((total, item) => total + item.quantity, 0);
        $('#totalItems').text(totalItems);
        
        // Tổng tiền
        const subtotal = selectedItems.reduce((total, item) => total + (item.price * item.quantity), 0);
        const discountPercentage = parseInt($('#discountPercentage').val()) || 0;
        const discountAmount = subtotal * (discountPercentage / 100);
        const totalAmount = subtotal - discountAmount;
        
        $('#totalAmount').text(`${totalAmount.toLocaleString()} đ`);
    }

    // Thay đổi % giảm giá
    $('#discountPercentage').on('input', function() {
        updatePaymentDetails();
        saveOrderToAPI();
    });

    // Lưu đơn hàng vào API
    function saveOrderToAPI() {
        // Kiểm tra xem đã chọn bàn chưa
        if (!currentTableId) {
            console.log("Chưa chọn bàn");
            return;
        }

        const orderData = {
            TableID: currentTableId,
            CustomerName: $('#customerName').val(),
            CustomerPhone: $('#customerPhone').val(),
            CustomerEmail: $('#customerEmail').val(),
            DiscountPercentage: $('#discountPercentage').val(),
            TotalAmount: parseFloat($('#totalAmount').text().replace(/[^\d]/g, '')),
            OrderDetails: selectedItems.map(item => ({
                FoodID: item.id,
                Quantity: item.quantity,
                Price: item.price
            }))
        };

        // Nếu chưa có OrderID, tạo mới order
        if (!currentOrderId) {
            $.ajax({
                url: 'http://localhost:5014/api/v1/Orders',
                type: 'POST',
                contentType: 'application/json',
                data: JSON.stringify(orderData),
                success: function(response) {
                    console.log("Tạo đơn hàng thành công", response);
                    currentOrderId = response.OrderID; // Lưu OrderID
                },
                error: function(error) {
                    console.error("Lỗi khi tạo đơn hàng:", error);
                }
            });
        } else {
            // Nếu đã có OrderID, update order
            $.ajax({
                url: `http://localhost:5014/api/v1/Orders/update/${currentOrderId}`,
                type: 'PUT',
                contentType: 'application/json',
                data: JSON.stringify(orderData),
                success: function(response) {
                    console.log("Cập nhật đơn hàng thành công", response);
                    
                },
                error: function(error) {
                    console.error("Lỗi khi cập nhật đơn hàng:", error);
                }
            });
        }
    }

    // Hàm load đơn hàng từ API
    function loadOrderFromAPI(tableId) {
        $.ajax({
            url: `http://localhost:5014/api/v1/Orders/table/${tableId}`,
            type: 'GET',
            success: function(response) {
                if (response) {
                    // Lưu OrderID
                    currentOrderId = response.OrderID; // Lưu OrderID
                    dateTime = response.CreatedDate;
                    // Điền thông tin khách hàng
                    $('#customerName').val(response.CustomerName);
                    $('#customerPhone').val(response.CustomerPhone);
                    $('#customerEmail').val(response.CustomerEmail);
                    $('#discountPercentage').val(response.DiscountPercentage);
                    
                    // Xử lý OrderDetails
                    let orderDetails = response.OrderDetails;

                    // Kiểm tra và parse OrderDetails
                    if (typeof orderDetails === "string") {
                        try {
                            orderDetails = JSON.parse(orderDetails);
                        } catch (error) {
                            console.error("Không thể parse OrderDetails:", error);
                            orderDetails = [];
                        }
                    }
                    
                    // Khôi phục danh sách món ăn
                    if (Array.isArray(orderDetails)) {
                        selectedItems = orderDetails.map(detail => ({
                            id: detail.FoodID,
                            name: detail.FoodName,
                            price: detail.Price,
                            quantity: detail.Quantity
                        }));
                    } else {
                        console.error("OrderDetails không phải là mảng:", orderDetails);
                        selectedItems = [];
                    }
                    
                    renderSelectedItems();
                    updatePaymentDetails();
                }
            },
            error: function(error) {
                console.error("Lỗi khi tải đơn hàng:", error);
                // Nếu không có đơn hàng, reset currentOrderId
                currentOrderId = null;
            }
        });
    }

    // Thanh toán
    $('#paymentButton').on('click', function() {
        const customerName = $('#customerName').val();
        const customerPhone = $('#customerPhone').val();
        
        if (selectedItems.length === 0) {
            alert('Vui lòng chọn món ăn');
            return;
        }
        
        if (!customerName || !customerPhone) {
            alert('Vui lòng nhập thông tin khách hàng');
            return;
        }
        
        // Gọi API thanh toán
        $.ajax({
            url: `http://localhost:5014/api/v1/Orders/payment/${currentTableId}`,
            type: 'POST',
            success: function(response) {
                alert('Thanh toán thành công');
                // Hiển thị hóa đơn
                renderInvoice(response);
                $('#invoiceModal').show();
            },
            error: function(error) {
                console.error("Lỗi thanh toán:", error);
                alert('Có lỗi xảy ra khi thanh toán');
            }
        });
    });

    // Hiển thị hóa đơn
    function renderInvoice(orderData) {
        const invoiceDetails = $('#invoiceDetails');
        invoiceDetails.empty();
        
        let html = `
            <p><strong>Mã hóa đơn:</strong> ${orderData.OrderID}</p>
            <p><strong>Khách hàng:</strong> ${$('#customerName').val()} (${$('#customerPhone').val()})</p>
            <p><strong>Thời gian:</strong> ${new Date().toLocaleString()}</p>
            <table>
                <thead>
                    <tr>
                        <th>Tên món</th>
                        <th>Số lượng</th>
                        <th>Đơn giá</th>
                        <th>Thành tiền</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        selectedItems.forEach(item => {
            html += `
                <tr>
                    <td>${item.name}</td>
                    <td>${item.quantity}</td>
                    <td>${item.price.toLocaleString()} đ</td>
                    <td>${(item.price * item.quantity).toLocaleString()} đ</td>
                </tr>
            `;
        });

        const totalAmount = parseFloat($('#totalAmount').text().replace(/[^\d]/g, ''));
        html += `
                </tbody>
            </table>
            <p><strong>Tổng tiền:</strong> ${totalAmount.toLocaleString()} đ</p>
        `;

        invoiceDetails.html(html);
    }

    // Đóng modal hóa đơn
    $('#closeInvoiceModal').on('click', function() {
        $('#invoiceModal').hide();
        window.location.href = 'tableorder.html'; 
    });
    // Khởi tạo
    loadMenuItemsFromAPI();
    if (currentTableId) {
        loadOrderFromAPI(currentTableId);
    }
    updatePaymentDetails();
});
