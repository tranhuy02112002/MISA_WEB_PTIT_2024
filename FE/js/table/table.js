$(document).ready(function () {

    // Hàm tải danh sách bàn ăn từ API
    function loadTables() {
        let dem = 0;
        $.ajax({
            url: 'http://localhost:5014/api/v1/Tables', // Gọi API lấy danh sách bàn ăn
            type: 'GET',
            dataType: 'json',
            success: function (response) {
                console.log(response);
                var tableList = $("#tableList");
                tableList.empty(); // Xóa danh sách bàn ăn hiện tại

                if (response.length === 0) {
                    tableList.append("<p>Không có bàn ăn nào.</p>");
                    return;
                }

                response.sort(function (a, b) {
                    return a.TableNumber - b.TableNumber;  // Sắp xếp theo số bàn từ bé đến lớn
                });


                // Duyệt qua danh sách bàn ăn và hiển thị
                response.forEach(function (table) {
                    var tableItemHtml = `
                        <div class="table-item" data-id="${table.TableId}">
                            <div class="table-details">
                                <p class="table-number">Bàn số: ${table.TableNumber}</p>
                                <p class="table-capacity">Sức chứa: ${table.Seats}</p>
                                <div class="actions">
                                    <button class="btn btn-edit" data-id="${table.TableId}">Sửa</button>
                                    <button class="btn btn-delete" data-id="${table.TableId}">Xóa</button>
                                </div>
                            </div>
                        </div>
                    `;
                    dem++;
                    tableList.append(tableItemHtml); // Thêm bàn ăn vào danh sách
                });

                // Cập nhật tổng số bàn ăn
                $(".count-table").text("Tổng số bàn: " + dem);
            },
            error: function (error) {
                console.error("Lỗi khi tải danh sách bàn ăn.", error);
                alert("Không thể tải danh sách bàn ăn.");
            }
        });
    }

    // Gọi hàm loadTables khi trang được tải
    loadTables();

    // Xử lý form thêm bàn ăn
    $(".btn-add").on('click', function () {
        $("#addTableForm").show();  // Hiển thị form thêm bàn ăn
        // Reset form và thay đổi hành động khi nhấn nút "Lưu" thành thêm bàn ăn
        $("#tableNumber").val('');
        $("#tableCapacity").val('');
        $(".btn-save").text('Lưu');  // Đổi button save thành cập nhật
        $(".btn-save").off('click').on('click', function () {
            addTable();  // Gọi hàm addTable khi nhấn lưu
        });
    });

    // Lưu bàn ăn mới
    $(".btn-save").on('click', function () {
        addTable();
    });

    // Hủy form
    $(".btn-cancel").on('click', function () {
        $("#addTableForm").hide();  // Đóng form
    });

    // Hàm gửi yêu cầu thêm bàn ăn
    function addTable() {
        const tableNumber = document.getElementById("tableNumber").value;
        const tableCapacity = document.getElementById("tableCapacity").value;

        // Kiểm tra dữ liệu đầu vào
        if (!tableNumber || !tableCapacity) {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Tạo đối tượng bàn ăn
        const tableItem = {
            TableNumber: tableNumber,
            Seats: parseInt(tableCapacity),
            Status: 'Available' // Trạng thái mặc định là có sẵn
        };

        // Gửi yêu cầu thêm bàn ăn đến API
        $.ajax({
            url: 'http://localhost:5014/api/v1/Tables',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(tableItem),
            success: function (response) {
                alert("Bàn ăn đã được thêm thành công!");
                $("#addTableForm").hide();
                loadTables(); // Tải lại danh sách bàn ăn
            },
            error: function (error) {
                alert("Lỗi khi thêm bàn ăn: " + error.responseJSON.message);
                console.error(error);
            }
        });
    }

    // Xử lý xóa bàn ăn
    $(document).on('click', '.btn-delete', function () {
        var tableId = $(this).data('id');
        console.log(tableId);
        deleteTable(tableId);
    });

    // Hàm xóa bàn ăn
    function deleteTable(tableId) {
        if (confirm("Bạn có chắc chắn muốn xóa bàn ăn này?")) {
            $.ajax({
                url: 'http://localhost:5014/api/v1/Tables/' + tableId,  // Cập nhật URL đúng cho API xóa bàn ăn
                type: 'DELETE',
                success: function (response) {
                    alert("Bàn ăn đã được xóa.");
                    loadTables();  // Tải lại danh sách bàn ăn
                },
                error: function (error) {
                    alert("Lỗi khi xóa bàn ăn.");
                    console.error(error);
                }
            });
        }
    }

    // Xử lý sửa bàn ăn
    $(document).on('click', '.btn-edit', function () {
        var tableId = $(this).data('id');
        editTable(tableId);  // Gọi hàm editTable khi nhấn nút Sửa
    });

    // Hàm lấy thông tin bàn ăn và điền vào form sửa
    function editTable(tableId) {
        // Lấy thông tin bàn ăn hiện tại
        $.ajax({
            url: 'http://localhost:5014/api/v1/Tables/' + tableId,  // API lấy chi tiết bàn ăn
            type: 'GET',
            success: function (table) {
                // Điền thông tin vào form sửa
                $("#tableNumber").val(table.TableNumber);
                $("#tableCapacity").val(table.Seats);
                $("#addTableForm").show();  // Hiển thị form để sửa
                $(".btn-save").text('Cập nhật bàn ăn');  // Đổi button save thành cập nhật
                // Thay đổi hành động khi nhấn nút lưu
                $(".btn-save").off('click').on('click', function () {
                    updateTable(table.TableId);  // Gọi hàm updateTable khi nhấn lưu
                });
            },
            error: function (error) {
                alert("Lỗi khi lấy thông tin bàn ăn.");
                console.error(error);
            }
        });
    }

    // Hàm cập nhật bàn ăn
    function updateTable(tableId) {
        var tableNumber = $("#tableNumber").val();
        var tableCapacity = $("#tableCapacity").val();

        if (tableNumber === "" || tableCapacity === "") {
            alert("Vui lòng điền đầy đủ thông tin.");
            return;
        }

        // Tạo đối tượng bàn ăn mới với thông tin sửa
        var tableItem = {
            TableId: tableId,
            TableNumber: tableNumber,
            Seats: parseInt(tableCapacity),
            Status: 'Available' // Trạng thái mặc định
        };

        // Gửi yêu cầu cập nhật bàn ăn
        $.ajax({
            url: 'http://localhost:5014/api/v1/Tables/' + tableId,  // API cập nhật bàn ăn
            type: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify(tableItem),
            success: function (response) {
                alert("Bàn ăn đã được cập nhật.");
                loadTables(); // Tải lại danh sách bàn ăn
                $("#addTableForm").hide();  // Đóng form
            },
            error: function (error) {
                alert("Lỗi khi cập nhật bàn ăn.");
                console.error(error);
            }
        });
    }

});
