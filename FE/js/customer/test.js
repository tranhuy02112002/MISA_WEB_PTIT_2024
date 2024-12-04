$(document).ready(function () {
    // Hàm tải danh sách bàn từ API
    function loadTables() {
        $.ajax({
            url: 'http://localhost:5014/api/v1/Tables', 
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log(response);
                const tableGrid = $("#tableGrid");
                tableGrid.empty(); 

                if (response.length === 0) {
                    tableGrid.append("<p>Không có bàn ăn nào.</p>");
                    return;
                }

                // Sắp xếp danh sách bàn theo TableNumber (số bàn) từ bé đến lớn
                response.sort(function (a, b) {
                    return a.TableNumber - b.TableNumber;
                });

                // Hiển thị danh sách bàn
                response.forEach(function (table) {
                    const statusClass = table.Status === 'Available' ? 'table-available' : 'table-occupied';
                    const tableHtml = `
                        <div class="table-item ${statusClass}" 
                             data-id="${table.TableId}" 
                             data-status="${table.Status}"
                             data-table-number="${table.TableNumber}"
                             data-seats="${table.Seats}">
                            <div class="table-number">Bàn: ${table.TableNumber}</div>
                            <div class="table-seats">${table.Seats} chỗ</div>
                        </div>
                    `;
                    tableGrid.append(tableHtml);
                });
            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách bàn.", error);
                alert("Không thể tải danh sách bàn ăn.");
            }
        });
    }

    // Gọi hàm loadTables khi trang được tải
    loadTables();

    // Xử lý sự kiện click vào bàn để thay đổi trạng thái và màu sắc
    $(document).on('click', '.table-item', function () {
        const tableId = $(this).data('id');
        const tableNumber = $(this).data('table-number');
        const tableSeats = $(this).data('seats');
        const currentStatus = $(this).data('status');

        // Lưu thông tin bàn vào localStorage
        localStorage.setItem('selectedTableId', tableId);
        console.log("ID của bàn đã chọn:", tableId);
        localStorage.setItem('selectedTableNumber', tableNumber);
        localStorage.setItem('selectedTableSeats', tableSeats);
        window.location.href = 'orderfood.html'; 
    });



    // Xóa localStorage khi tải trang để tránh dữ liệu cũ
    localStorage.removeItem('selectedTableId');
    localStorage.removeItem('selectedTableNumber');
    localStorage.removeItem('selectedTableSeats');
});
