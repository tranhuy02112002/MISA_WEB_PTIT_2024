
$(document).ready(function() {
    new EmployeePage();
    
});
let int ="0";
let employeeIDForDelete = null; 
var initialNoticeContent = $("#noticeContent").html();
var initialNoticeContent1 = $("#noticeContent1").html();

var formMode = ""; // Khai báo biến
let employeeIDForUpdate = null; 



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
            console.log(int);
            var me = this;
            // Click button add hiển thị form nhân viên
            $("#btnShowDialog").on('click', function() {
                formMode ="add";
                me.showDialog();
            });
            $(document).on('click', ".m-fix", function() {
                formMode = "edit";
                // Tìm phần tử <tr> gần nhất (cha của nút)
                let $tr = $(this).closest('tr');
                // Lấy dữ liệu từ <tr> (nếu có gán dữ liệu vào data-attribute)
                let employee = $tr.data("entity");
                employeeIDForUpdate = employee.EmployeeId;
                $("#txtEmployeeCode").val(employee.EmployeeCode);
                $("#txtfullName").val(employee.FullName);

                let dob = new Date(employee.DateOfBirth);
                let year = dob.getFullYear();
                let month = (dob.getMonth() + 1).toString().padStart(2, '0'); // Tháng bắt đầu từ 0, nên cộng 1
                let day = dob.getDate().toString().padStart(2, '0'); // Đảm bảo ngày luôn có 2 chữ số

                let dobFormatted = `${year}-${month}-${day}`;
                $("#txtDob").val(dobFormatted);
                const employeeGender = employee.Gender;
                if (employeeGender === 0) {
                    $('#male').prop('checked', true);
                } else if (employeeGender === 1) {
                    $('#female').prop('checked', true);
                } else if (employeeGender === 2) {
                    $('#other').prop('checked', true);
                }
                // let selectedGender = $('input[name="gender"]:checked').val();
                // $("#txtPosition").val(employee.PositionName);
                if (employee.PositionName === "Lap Trinh Vien") {
                    $("#txtPositionName").val("nhanvien");
                } else if (employee.PositionName === "Nha Thiet Ke Do Hoa") {
                    $("#txtPositionName").val("quanly");
                } else if (employee.PositionName === "Ky su an ninh mang") {
                    $("#txtPositionName").val("kysuanninhmang");
                } else {
                    $("#txtPositionName").val("");
                }
                
                $("#txtIdentityNumber").val(employee.IdentityNumber);

                let createdDate = new Date(employee.IdentityDate);
                let yearCreated = createdDate.getFullYear();
                let monthCreated = (createdDate.getMonth() + 1).toString().padStart(2, '0');
                let dayCreated = createdDate.getDate().toString().padStart(2, '0');
                
                $("#txtIdentityDate").val(`${yearCreated}-${monthCreated}-${dayCreated}`);
                // $("#txtDepartmentName").val(employee.DepartmentName);
                if (employee.DepartmentName === "Phong Ky thuat") {
                    $("#txtDepartmentName").val("phongkythuat");
                } else if (employee.DepartmentName === "Phong Thiet ke") {
                    $("#txtDepartmentName").val("phongthietke");
                } else if (employee.DepartmentName === "Phong an ninh mang") {
                    $("#txtDepartmentName").val("phonganninhmang");
                } else {
                    // Giá trị mặc định hoặc xử lý trường hợp không khớp
                    $("#txtDepartmentName").val("");
                }                
                $("#txtIdentityPlace").val(employee.IdentityPlace);
                $("#txtAddress").val(employee.Address);
                $("#txtPhoneNumber").val(employee.PhoneNumber);
                $("#txtLandlineNumber").val(employee.LandlineNumber);
                $("#txtEmail").val(employee.Email);
                $("#txtBankAccount").val(employee.BankAccount);
                $("#txtBankName").val(employee.BankName);
                $("#txtBranch").val(employee.Branch);

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

            //Tắt notice hoặc xóa nhân viên
            $(document).on('click',".m-dialog-notice-button-confirm", function() {
                console.log("oke");
                if (int === "1") {
                    me.deleteEmployee(); // Gọi hàm deleteEmployee nếu int bằng 1
                } else {
                    $(this).closest("[mdialog]").css("visibility", "hidden");
                    me.inputInvalids[0].focus(); // Đóng dialog nếu int không bằng 1
                }
            });

            $(document).on('click', ".m-delete", function() {
                try {
                    int = "1";
                    console.log(int);
                    let $tr = $(this).closest('tr');
                    let employee = $tr.data("entity");
                    employeeIDForDelete = employee.EmployeeId;
                    // Đặt lại nội dung của dòng thông báo về trạng thái ban đầu
                    $("#noticeContent").html(initialNoticeContent);
                    $("#noticeContent1").html(initialNoticeContent1);
                    // Hiển thị form thông báo
                    $("#dlgNotice").css("visibility", "visible");
                    console.log('Employee Data:', employee);
                } catch (error) {
                    console.error("Không hiện thông báo được ...");
                }
            });


            

            // Đóng mở Navbar
            $("#toggleNavbar").on('click', this.toggleNavbar);

            // Thêm mới dữ liệu
            $('#btnAddEmployee').on('click', this.addEmployee.bind(this));

        

        } catch (error) {
            console.error(error);
        }
    }
    //deleteEmpoyee
    deleteEmployee() {
        $.ajax({
            type: "DELETE",
            url: `http://localhost:5014/api/v1/Employees/${employeeIDForDelete}`,
            contentType: "application/json",
            success: function(response){
                console.log("Xóa nhân viên thành công:", response);
                $(".m-dialog[mdialog]").css("visibility", "hidden");
                this.loadData(); // Tải lại dữ liệu sau khi xóa thành công
                alert("Xóa nhân viên thành công")
            }.bind(this),
            error: function(xhr, status, error){
                console.error("Lỗi khi xóa nhân viên:", xhr.responseText, status, error);
                alert("Lỗi khi xóa nhân viên");
            }.bind(this)
        });
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

    // Thêm mới nhân viên và Sửa nhân viên
    addEmployee() {
        try {

            int = "0";
            console.log(int);
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
                let gender = $('input[name="gender"]:checked').val();
                let position = $("#txtPositionName option:selected").text();
                console.log(position);
                let identityNumber = $("#txtIdentityNumber").val();
                let identityDate = $("#txtIdentityDate").val();
                let departmentName = $("#txtDepartmentName option:selected").text();
                let identityPlace = $("#txtIdentityPlace").val();
                let address = $("#txtAddress").val();
                let phoneNumber = $("#txtPhoneNumber").val();
                let landlineNumber = $("#txtLandlineNumber").val();
                let email = $("#txtEmail").val();
                let bankAccount = $("#txtBankAccount").val();
                let bankName = $("#txtBankName").val();
                let branch = $("#txtBranch").val();

                if (identityDate) {
                    identityDate = new Date(identityDate);
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
                    "Gender": gender,
                    "DateOfBirth": dob,
                    "PhoneNumber": phoneNumber,
                    "LandlineNumber":landlineNumber,
                    "IdentityNumber": identityNumber,
                    "IdentityDate": identityDate,
                    "IdentityPlace": identityPlace,
                    "Email": email,
                    "Address": address,
                    "PositionName": position,
                    "DepartmentName": departmentName,
                    "BankAccount": bankAccount,
                    "BankName": bankName,
                    "Branch": branch

                }

                console.log(employeeIDForUpdate);
                   
                let employee2 = {
                    "EmployeeID": employeeIDForUpdate,
                    "EmployeeCode": employeeCode,
                    "FullName": fullName,
                    "Gender": gender,
                    "DateOfBirth": dob,
                    "PhoneNumber": phoneNumber,
                    "LandlineNumber":landlineNumber,
                    "IdentityNumber": identityNumber,
                    "IdentityDate": identityDate,
                    "IdentityPlace": identityPlace,
                    "Email": email,
                    "Address": address,
                    "PositionName": position,
                    "DepartmentName": departmentName,
                    "BankAccount": bankAccount,
                    "BankName": bankName,
                    "Branch": branch
                }

                console.log(employee2);
                if(formMode === "add"){

                    $.ajax({
                        type: "POST",
                        url: "http://localhost:5014/api/v1/Employees",
                        data: JSON.stringify(employee),
                        contentType: "application/json",
                        dataType: "json",
                        success: function(response){
                            console.log("Thêm nhân viên thành công:", response);
                            $(".m-dialog[mdialog]").css("visibility", "hidden");
                            this.loadData();
                            alert("Thêm nhân viên thành công")
                        }.bind(this),
                        error: function(xhr, status, error){
                            console.error("Lỗi khi thêm nhân viên:", xhr.responseText, status, error);
                            alert("Lỗi khi thêm nhân viên")
                        }.bind(this)
                    });
                }else{
                    $.ajax({
                        type:"PUT",
                        url: `http://localhost:5014/api/v1/Employees/${employeeIDForUpdate}`,
                        data: JSON.stringify(employee2),
                        contentType: "application/json",
                        dataType: "json",
                        success: function(response){
                            console.log("Sửa nhân viên thành công:", response);
                            $(".m-dialog[mdialog]").css("visibility", "hidden");
                            this.loadData();
                            alert("Sửa nhân viên thành công")
                        }.bind(this),
                        error: function(xhr, status, error){
                            console.error("Lỗi khi sửa nhân viên:", xhr.responseText, status, error);
                            alert("Lỗi khi sửa nhân viên")
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
            fetch("http://localhost:5014/api/v1/Employees")
                .then(res => res.json())
                .then(data => {
                    console.log(data);
                    // Lấy ra table
                    const $table = $("#tblEmployees tbody");
                    $table.empty(); // Xóa các hàng cũ nếu có
    
                    // Duyệt từng phần tử trong data
                    let i = 1;
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
    
                        // Chuyển đổi giá trị Gender từ số sang chuỗi
                        let genderText = "";
                        switch(item.Gender) {
                            case 0: 
                                genderText = "Nam";
                                break;
                            case 1: 
                                genderText = "Nữ";
                                break;
                            case 2: 
                                genderText = "Khác";
                                break;
                            default:
                                genderText = "Không xác định";
                        }
    
                        let el = $(`
                            <tr>
                                <td class="text-align-left">${i}</td>
                                <td class="text-align-left">${item.EmployeeCode}</td>
                                <td class="text-align-left">${item.FullName}</td>
                                <td class="text-align-left">${genderText}</td>
                                <td class="text-align-center">${DateOfBirth}</td>
                                <td class="text-align-left">${item.Email}</td>
                                <td class="text-align-left" style="display: flex; border-style: none;">
                                    <div style="margin-top: 9px; width: 250px;">${item.Address}</div>
                                    <button class="m-fix m-all"></button>
                                    <button class="m-add m-all"></button>
                                    <button class="m-delete m-all"></button>
                                </td>
                            </tr>
                        `);
                        el.data("entity",item);
                        $table.append(el);
                        i++;
                    });
                    $(`.m-loading`).hide();
                })
                .catch(error => {
                    console.error(error);
                    $(`.m-loading`).hide(); // Ẩn loading khi gặp lỗi
                });
        } catch (error) {
            console.error(error);
            $(`.m-loading`).hide(); // Ẩn loading khi gặp lỗi
        }
    }
    
}



function showNotice() {
    try {
        int ="1";
        console.log(int);
        // Đặt lại nội dung của dòng thông báo về trạng thái ban đầu
        $("#noticeContent").html(initialNoticeContent);
        $("#noticeContent1").html(initialNoticeContent1);
        // Hiển thị form thông báo
        $("#dlgNotice").css("visibility", "visible");
    } catch (error) {
        console.error("Không hiện thông báo được ...");
    }
}

