$(document).ready(function() {
    new EmployeePage();
});

class EmployeePage {
    pageTitle = "Quản lý nhân viên";
    inputInvalids = [];

    constructor() {
        console.log("Constructor...");
        this.initEvents();
        this.loadData();
    }

    /* Khởi tạo các sự kiện trong page 
    *Author: TQHuy (10/7/2024) */
    initEvents() {
        try {
            var me = this;

            // Click button add hiển thị form nhân viên
            $("#btnShowDialog").on('click', this.showDialog);

            // Refresh dữ liệu
            $("#btnRefresh").on('click', this.btnRefreshOnclick);

            // Close dialog
            $("[mdialog] .btn-dialog--close").on('click', function() {
                $(this).closest("[mdialog]").css("visibility", "hidden");
            });

            $("[mdialog] .m-dialog-notice-button-confirm").on('click', function() {
                $(this).closest("[mdialog]").css("visibility", "hidden");
                me.inputInvalids[0].focus();
            });

            // Đóng mở Navbar
            $("#toggleNavbar").on('click', this.toggleNavbar);

            // Thêm mới dữ liệu
            $('#btnAddEmployee').on('click', this.addEmployee.bind(this));

        

        } catch (error) {
            console.error(error);
        }
    }

    // Show ra bảng thêm nhân viên
    showDialog() {
        try {
            // Hiển thị form thêm mới
            // 1. Lấy ra element của form thêm mới
            $("#dlgDialog").css("visibility", "visible");
            // 2. Set hiển thị form
        } catch (error) {
            console.error("Không thêm được ...");
        }
    }

    // Refresh lại bảng nhân viên
    btnRefreshOnclick() {
        try {
            // Xử lý refresh dữ liệu
        } catch (error) {
            console.error(error);
        }
    }

    // To nhỏ navbar
    toggleNavbar() {
        try {
            var navbar = $('#navbar');
            navbar.toggleClass('collapsed');

            // Thay đổi nội dung nút
            var toggleButton = $("#toggleNavbar");
            if (navbar.hasClass('collapsed')) {
                toggleButton.text('Mở rộng');
            } else {
                toggleButton.text('Thu gọn');
            }

        } catch (error) {
            console.error(error);
        }
    }

    // Thêm mới nhân viên
    addEmployee() {
        try {
            // Thực hiện validate dữ liệu
            const validateRequired = this.checkRequiredInput();
            if (validateRequired.errors.length > 0) {
                let dialogNotice = $(".m-dialog.m-dialog-notice");
                // Hiển thị thông báo lên
                dialogNotice.css("visibility", "visible");

                // Thay đổi tiêu đề của thông báo
                $(".m-dialog-title").html("Dữ liệu không hợp lệ");

                // Thay đổi nội dung của thông báo
                let errorElement = $(".m-dialog-notice-text");
                // Xóa nội dung cũ trước khi thay mới
                errorElement.html("");

                // Duyệt từng nội dung thông báo để append vào
                $.each(validateRequired.errors, function(index, Msg) {
                    let li = $("<li></li>").text(Msg);
                    errorElement.append(li);
                });
                this.inputInvalids = validateRequired.inputInvalid;
            } else {
                // Call API để thêm mới nhân viên
            }
        } catch (error) {
            console.error(error);
        }
    }

    checkRequiredInput() {
        try {
            let result = {
                inputInvalid: [],
                errors: []
            };

            // Lấy ra tất cả các input bắt buộc phải nhập
            let inputs = $("#dlgDialog input[required]");
            inputs.each(function() {
                const value = $(this).val();
                if (value === "" || value === null || value === undefined) {
                    const label = $(this).prev().find(".label-text").text();
                    $(this).addClass("input--invalid");
                    result.inputInvalid.push(this);
                    result.errors.push(`${label} không được phép để trống`);
                } else {
                    $(this).removeClass("input--invalid");
                    $(this).css("border-color", ""); // Đặt lại màu viền mặc định

                    // Kiểm tra và xóa thông báo lỗi nếu có
                    if ($(this).next(".control_text--error").length) {
                        $(this).next(".control_text--error").remove();
                    }
                }
            });
            return result;
        } catch (error) {
            console.log(error);
        }
    }

    addErrorElementToInputNotValid(input) {
        try {
            $(input).css("border-color", "red");

            // Kiểm tra xem đã có thông báo lỗi nào chưa
            if ($(input).next(".control_text--error").length) {
                return;
            }

            // Bổ sung thông tin lỗi dưới input không hợp lệ
            let elError = $("<div></div>").addClass("control_text--error").text("Không được phép để trống.");
            $(input).after(elError);
        } catch (error) {
            console.log(error);
        }
    }

    loadData() {
        try {
            // Gọi API lấy dữ liệu:
            fetch("https://cukcuk.manhnv.net/api/v1/Employees")
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    // Lấy ra table
                    const $table = $("#tblEmployees tbody");
                    $table.empty(); // Xóa các hàng cũ nếu có

                    // Duyệt từng phần tử trong data
                    $.each(data, function(index, item) {
                        let DateOfBirth = item.DateOfBirth ? new Date(item.DateOfBirth) : "";
                        if (DateOfBirth) {
                            let date = DateOfBirth.getDate();
                            date = date < 10 ? `0${date}` : date;
                            let month = DateOfBirth.getMonth() + 1;
                            month = month < 10 ? `0${month}` : month;
                            let year = DateOfBirth.getFullYear();
                            DateOfBirth = `${date}/${month}/${year}`;
                        } else {
                            DateOfBirth = "";
                        }

                        let $tr = $(`
                            <tr>
                                <td class="text-align-left">${item.Gender}</td>
                                <td class="text-align-left">${item.EmployeeCode}</td>
                                <td class="text-align-left">${item.FullName}</td>
                                <td class="text-align-left">${item.GenderName}</td>
                                <td class="text-align-center">${DateOfBirth}</td>
                                <td class="text-align-left">${item.Email}</td>
                                <td class="text-align-left" style="display: flex; border-style: none;">
                                    <div style="margin-top: 9px; width: 250px;">${item.Address}</div>
                                    <button class="m-fix m-all"></button>
                                    <button class="m-add m-all"></button>
                                    <button class="m-delete m-all" onclick="showNotice()"></button>
                                </td>
                            </tr>
                        `);

                        $table.append($tr);
                    });
                });
        } catch (error) {
            console.error(error);
        }
    }
}

// Hiển thị thông báo
// function showNotice() {
//     try {
//         // Lấy ra element của form thông báo
//         $("#dlgNotice").css("visibility", "visible");
//     } catch (error) {
//         console.error("Không hiện thông báo được ...");
//     }
    
// }


var initialNoticeContent = $("#noticeContent").html();
var initialNoticeContent1 = $("#noticeContent1").html();

function showNotice() {
    try {
        // Đặt lại nội dung của dòng thông báo về trạng thái ban đầu
        $("#noticeContent").html(initialNoticeContent);
        $("#noticeContent1").html(initialNoticeContent1);
        // Hiển thị form thông báo
        $("#dlgNotice").css("visibility", "visible");
    } catch (error) {
        console.error("Không hiện thông báo được ...");
    }
}

