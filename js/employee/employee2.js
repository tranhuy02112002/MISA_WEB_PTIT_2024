

$(document).ready(function() {
    new EmployeePage();
    
});

class EmployeePage {
    pageTitle = "Quản lý nhân viên";
    inputInvalids = [];
    formMode = ""; // Khai báo biến
    employeeIDForUpdate = null; 
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
            $("#btnShowDialog").on('click', function() {
                me.formMode ="add";
                me.showDialog();
            });
            $(document).on('click', ".m-fix", function() {
                me.formMode = "edit";
                // Tìm phần tử <tr> gần nhất (cha của nút)
                let $tr = $(this).closest('tr');
                // Lấy dữ liệu từ <tr> (nếu có gán dữ liệu vào data-attribute)
                let employee = $tr.data("entity");
                me.employeeIDForUpdate = employee.EmployeeId;
                $("#txtEmployeeCode").val(employee.EmployeeCode);
                $("#txtfullName").val(employee.FullName);
                $("#txtDob").val(employee.DateOfBirth);
                const employeeGender = employee.Gender;
                if (employeeGender === 1) {
                    $('#male').prop('checked', true);
                } else if (employeeGender === 0) {
                    $('#female').prop('checked', true);
                } else if (employeeGender === 2) {
                    $('#other').prop('checked', true);
                }
                let selectedGender = $('input[name="gender"]:checked').val();
                $("#txtPosition").val(employee.PositionName);
                $("#txtPersonalTaxCode").val(employee.PersonalTaxCode);
                $("#txtCreatedDate").val(employee.CreatedDate);
                $("#txtDepartmentName").val(employee.DepartmentName);
                $("#txtCreatedBy").val(employee.CreatedBy);
                $("#txtAddress").val(employee.Address);
                $("#txtPhoneNumber").val(employee.PhoneNumber);
                $("#txtIdentityNumber").val(employee.IdentityNumber);
                $("#txtEmail").val(employee.Email);
                $("#txtBankAccount").val(employee.QualificationName);
                $("#txtBankName").val(employee.ModifiedBy);
                $("#txtBranch").val(employee.MartialStatusName);

                // Log dữ liệu để kiểm tra
                console.log('Employee Data:', employee);
            
                // Gọi phương thức showDialog của instance EmployeePage
                me.showDialog();
            });
            
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
                dialogNotice.css("visibility", "visible");
                $(".m-dialog-title").html("Dữ liệu không hợp lệ");
                let errorElement = $(".m-dialog-notice-text");
                errorElement.html("");
                $.each(validateRequired.errors, function(index, Msg) {
                    let li = $("<li></li>").text(Msg);
                    errorElement.append(li);
                });
                this.inputInvalids = validateRequired.inputInvalid;
            } else {
                let employeeCode = $("#txtEmployeeCode").val();
                let fullName = $("#txtfullName").val();
                let dob = $("#txtDob").val();
                let selectedGender = $('input[name="gender"]:checked').val();
                let position = $("#txtPosition").val();
                let personalTaxCode = $("#txtPersonalTaxCode").val();
                let createdDate = $("#txtCreatedDate").val();
                let departmentName = $("#txtDepartmentName").val();
                let createdBy = $("#txtCreatedBy").val();
                let address = $("#txtAddress").val();
                let phoneNumber = $("#txtPhoneNumber").val();
                let identityNumber = $("#txtIdentityNumber").val();
                let email = $("#txtEmail").val();
                let bankAccount = $("#txtBankAccount").val();
                let bankName = $("#txtBankName").val();
                let branch = $("#txtBranch").val();

                if (createdDate) {
                    createdDate = new Date(createdDate);
                }
                if (dob) {
                    dob = new Date(dob);
                }
                if (dob > new Date()) {
                    alert("Ngày sinh không được phép lớn hơn ngày hiện tại");
                    return;
                }
                let employee = {
                    "EmployeeCode": employeeCode,
                    "FullName": fullName,
                    "Gender": selectedGender,
                    "DateOfBirth": dob,
                    "PhoneNumber": phoneNumber,
                    "PersonalTaxCode": personalTaxCode,
                    "Email": email,
                    "Address": address,
                    "IdentityNumber": identityNumber,
                    "PositionName": position,
                    "DepartmentName": departmentName,
                    "CreatedDate": createdDate,
                    "CreatedBy": createdBy,
                    "QualificationName": bankAccount,
                    "ModifiedBy": bankName,
                    "MartialStatusName": branch
                    // "EmployeeCode": "00e0dd30fsf4",
                    // "FirstName": "Nguyễn Văn",
                    // "LastName": "Huệ",
                    // "FullName": "Nguyễn Văn Huệ",
                    // "Gender": 2,
                    // "DateOfBirth": "1996-01-03T00:00:00",
                    // "PhoneNumber": "0931051539",
                    // "Email": "AngeloMorin@example.com",
                    // "Address": "60 Thạnh Lộc 31",
                    // "IdentityNumber": "0756728920",
                    // "IdentityDate": "2005-06-07T00:00:00",
                    // "IdentityPlace": "Lào Cai",
                    // "JoinDate": "2019-01-02T00:00:00",
                    // "MartialStatus": 2,
                    // "EducationalBackground": 1,
                    // "QualificationId": "3541ff76-58f0-6d1a-e836-63d5d5eff719",
                    // "DepartmentId": "45ac3d26-18f2-18a9-3031-644313fbb055",
                    // "PositionId": "68992ee8-5906-72d0-55d1-35c781481818",
                    // "NationalityId": "b5cf83af-f756-11ec-9b48-00163e06abee",
                    // "WorkStatus": 2,
                    // "PersonalTaxCode": "0296069618",
                    // "Salary": 27105203.0,
                    // "PositionCode": null,
                    // "PositionName": null,
                    // "DepartmentCode": null,
                    // "DepartmentName": null,
                    // "QualificationName": null,
                    // "NationalityName": null,
                    // "GenderName": "(Chưa xác định)",
                    // "EducationalBackgroundName": "Trung học cơ sở",
                    // "MartialStatusName": "Sống chung chưa kết hôn",
                    // "CreatedDate": "2008-04-16T09:24:16",
                    // "CreatedBy": "Ashely Ackerman",
                    // "ModifiedDate": "1970-05-19T14:38:02",
                    // "ModifiedBy": "Adan Baumgartner"
                }
                if(this.formMode === "add"){
                    $.ajax({
                        type: "POST",
                        url: "https://cukcuk.manhnv.net/api/v1/Employees",
                        data: JSON.stringify(employee),
                        contentType: "application/json",
                        dataType: "json",
                        success: function(response){
                            console.log("Thêm nhân viên thành công:", response);
                            $(".m-dialog[mdialog]").css("visibility", "hidden");
                            this.loadData();
                        }.bind(this),
                        error: function(xhr, status, error){
                            console.error("Lỗi khi thêm nhân viên:", xhr.responseText, status, error);
                            alert("Lỗi khi thêm nhân viên")
                        }.bind(this)
                    });
                }else{
                    $.ajax({
                        type:"PUT",
                        url: `https://cukcuk.manhnv.net/api/v1/Employees/${this.employeeIDForUpdate}`,
                        data: JSON.stringify(employee),
                        contentType: "application/json",
                        dataType: "json",
                        success: function(response){
                            console.log("Sửa nhân viên thành công:", response);
                            $(".m-dialog[mdialog]").css("visibility", "hidden");
                            this.loadData();
                        }.bind(this),
                        error: function(xhr, status, error){
                            console.error("Lỗi khi thêm nhân viên:", xhr.responseText, status, error);
                            alert("Lỗi khi thêm nhân viên")
                        }.bind(this)
                    });
                }
               
            }
        } catch (error) {
            console.error("Lỗi trong hàm addEmployee:", error);
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
            $(`.m-loading`).show();
            // Gọi API lấy dữ liệu:
            fetch("https://cukcuk.manhnv.net/api/v1/Employees")
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    // Lấy ra table
                    const $table = $("#tblEmployees tbody");
                    $table.empty(); // Xóa các hàng cũ nếu có

                    // Duyệt từng phần tử trong data
                    let i=1;
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

                        let el = $(`
                            <tr>
                                <td class="text-align-left">${i}</td>
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
                        el.data("entity",item);
                        $table.append(el);
                        i=i+1;
                    });
                    $(`.m-loading`).hide();
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

