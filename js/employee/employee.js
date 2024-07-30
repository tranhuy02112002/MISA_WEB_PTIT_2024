window.onload = function(){
    new EmployeePage();
}


class EmployeePage{
    pageTitle = "Quản lý nhân viên";
    inputInvalids = []; 
    constructor(){
        console.log("Constuctor...");
        this.initEvens();
        this.laodData();
    }

   /* Khới tạo các sự kiện trong page 4
    *Author: TQHuy (10/7/2024) */

    initEvens(){
        try {
        var me = this;
        //Click button add hiển thị form nhân viên
        document.querySelector("#btnShowDialog").addEventListener('click', this.showDialog )


        // Refresh dữ liệu 
        document.querySelector("#btnRefresh").addEventListener('click', this.btnRefreshOnclick)
        //Refresh dữ liệu:

        //Xóa 1 nhân viên:

        //Close dialog
        // document.querySelector("#btnCloseDialog").addEventListener('click', this.btnCloseDialog)

        const buttons = document.querySelectorAll("[mdialog] .btn-dialog--close");
        for(const button of buttons){
            button.addEventListener('click',function(){
                console.log(this);
                this.parentElement.parentElement.parentElement.style.visibility="hidden";
            })
        }

        document.querySelector("[mdialog] .m-dialog-notice-button-confirm").addEventListener('click',function(){
            this.parentElement.parentElement.parentElement.style.visibility="hidden";
            me.inputInvalids[0].focus();
        })

        //Lưu nhân viên

        //Đóng mở Navbar
        document.querySelector("#toggleNavbar").addEventListener('click', this.toggleNavbar)

        // Thông báo có xáo hay không
        // document.querySelector("#btnDeleteEmployee").addEventListener('click', this.showNotice )

        // document.querySelector(".m-dialog-notice-header .m-dialog-close").addEventListener('click',()=>{
        //     document.querySelector(".m-dialog.m-dialog-notice").style.visibility="hidden";
        // })


        //Thêm mới dữ liệu

        document.querySelector('#btnAddEmployee').addEventListener('click',this.addEmployee.bind(this))

        } catch (error) {
            console.error(erro);
            
        }
      
    }

    //Show ra bảng thêm nhân viên
    showDialog() {
        try {
            // Hiển thị form thêm mới
            // 1. Lấy ra elêmnt của form thêm mới
            const dialog = document.getElementById("dlgDialog");
            dialog.style.visibility="visible";
            // 2. Set hiển thị form

 
        } catch (error) {
            console.error("Không thêm được ...");
        }   
    }
    //Refresh lại bảng nhân viên
    btnRefreshOnclick(){
        try {

        } catch (error) {
            console.error(erro);
        }
    }

    // Close form thêm mới nhân viên
    // btnCloseDialog(){
    //     try {
    //         const dialog = document.getElementById("dlgDialog");
    //         dialog.style.visibility="hidden";
            
    //     } catch (error) {
    //         console.error(erro);
    //     }
    // }

    // To nhỏ navbar
    toggleNavbar(){
        try {

            var navbar = document.getElementById('navbar');
            navbar.classList.toggle('collapsed');
            
            // Thay đổi nội dung nút
            var toggleButton = document.getElementById("toggleNavbar");
            if (navbar.classList.contains('collapsed')) {
                toggleButton.textContent = 'Mở rộng';
            } else {
                toggleButton.textContent = 'Thu gọn';
            }
            
        } catch (error) {
            console.error(erro);
        }
    }

    //Hiển thị thông báo
   

    //Thêm mới nhần viên
    addEmployee(){
        try {
            //Thực hiện Validda đữ liệu
            const validateRequired = this.checkRequiredInput();
            if(validateRequired.errors.length > 0){
                let dialogNotice = document.querySelector(".m-dialog.m-dialog-notice");
                //Hiển thị thông báo lên
                dialogNotice.style.visibility="visible";


                //Thay đổi tiều đề của thông báo
                document.querySelector(".m-dialog-title").innerHTML="Dữ liệu không hợp lệ";
                //Thay đổi nội dung của thông báo

                let errorElement = document.querySelector(".m-dialog-notice-text");
                //Xóa nội dung cũ trước khi thay mới
                errorElement.innerHTML="";


                //Duyệt từng nội dung thông báo để ta append vào
                for(const Msg of validateRequired.errors){
                    let li = document.createElement("li");
                    li.textContent=Msg;
                    errorElement.append(li);
                }
                this.inputInvalids   = validateRequired.inputInvalid;
            }else{
                //...Call api
            }
            
        } catch (error) {
            console.error(error);
            
        }
    }
    validateData() {
        let error = {

            inputInvalid:[],
             errors:[]
            
        };

        //check required
        error = this.checkRequiredInput();
    
        console.log(error.IsValid);
    
        return error;
    }

    checkRequiredInput(){
        try {
            let result = {
                inputInvalid:[],
                errors:[]
            };
            //  Lấy ra tát cả các  input bắt buộc phải nhập
            let inputs = document.querySelectorAll("#dlgDialog input[required]");
            for(const input of inputs){
                const value = input.value;
                if(value === "" || value===null || value === undefined){
                    const label = input.previousElementSibling.querySelector(".label-text");;
                    input.classList.add("input--invalid")
                    this.addErrorElementToInputNotValid(input);
                    result.inputInvalid.push(input);
                    result.errors.push(`${label.textContent} không được phép để trống`);
                }else{
                    input.classList.remove("input--invalid");
                    input.style.borderColor = ""; // Đặt lại màu viền mặc định

                    // Kiểm tra xem thông báo lỗi có tồn tại trước khi cố gắng xóa nó
                    const nextSibling = input.nextElementSibling;
                    if (nextSibling && nextSibling.classList.contains("control_text--error")) {
                        nextSibling.remove();
                    }
                }
            }
            return result;
            
        } catch (error) {

            console.log(error)
            
        }
    }

    addErrorElementToInputNotValid(input) {
        try {
            input.style.borderColor = "red";
    
            // Kiểm tra xem đã có thông báo lỗi nào chưa
            const nextSibling = input.nextElementSibling;
            if (nextSibling && nextSibling.classList.contains("control_text--error")) {
                return;
            }
    
            // Bổ sung thông tin lỗi dưới input không hợp lệ
            let elError = document.createElement("div");
            elError.classList.add("control_text--error");
            elError.textContent = "Không được phép để trống.";
            input.after(elError);
        } catch (error) {
            console.log(error);
        }
    }

    laodData(){
        try {
            // Goi API lấy dữ liệu:
            fetch("https://cukcuk.manhnv.net/api/v1/Employees")
            .then(res=>res.json())
            .then(data =>{
                console.log(data);
                // Lấy ra table
                const table = document.querySelector("#tblEmployees");
                //duyệt từng phần tử trong data
                for(const item of data){
                    let tr = document.createElement("tr");
                    let Gender = item.Gender;
                    let EmployeeCode = item.EmployeeCode;
                    let FullName = item.FullName;
                    let GenderName = item.GenderName;
                    let DateOfBirth = item["DateOfBirth"];
                    let Email = item.Email;
                    let Address = item.Address;
                    debugger;
                    if (DateOfBirth){
                        DateOfBirth = new Date(DateOfBirth);
                        let date = DateOfBirth.getDate();
                        date = date < 10 ? `0${date}`:date;
                        let month = DateOfBirth.getMonth()+1;
                        month = month < 10 ? `0${month}`:month;
                        let year = DateOfBirth.getFullYear();
                        DateOfBirth = `${date}/${month}/${year}`;
                    }else{
                        DateOfBirth = "";
                    }
                    debugger
                    tr.innerHTML = `
                                    <td class="text-align-left">${Gender}</td>
                                    <td class="text-align-left">${EmployeeCode}</td>
                                    <td class="text-align-left">${FullName}</td>
                                    <td class="text-align-left">${GenderName}</td>
                                    <td class="text-align-center">${DateOfBirth}</td>
                                    <td class="text-align-left">${Email}</td>
                                    <td class="text-align-left" style="display: flex; border-style: none;">
                                    <div style="margin-top: 9px; width: 250px;">${Address}</div>  
                                    <button class="m-fix m-all"></button><button class="m-add m-all"></button> <button class="m-delete m-all" onclick="showNotice()"></button> 
                                    </td>`;   
                        table.querySelector("tbody").appendChild(tr);          
                }
            }
            )
            
        } catch (error) {
            console.error(error);
        }
    }
    
}
//Hiển thị thông báo
function  showNotice() {
    try {
        // 1. Lấy ra element của form thông báo
        const dialog = document.getElementById("dlgNotice");
        dialog.style.visibility="visible";
        // 2. Set hiển thị form


    } catch (error) {
        console.error("Không hiện thông báo được ...");
    }   
}






// document.getElementById("btnShowDialog").addEventListener('click', function() {
        //     document.getElementById("dlgDialog").style.display = 'block';
        // });

  

// function toggleNavbar() {
//     var navbar = document.querySelector('.navbar');
//     navbar.classList.toggle('collapsed');
    
//     // Thay đổi nội dung nút
//     var toggleButton = document.querySelector('.toggle-button span');
//     if (navbar.classList.contains('collapsed')) {
//         toggleButton.textContent = 'Mở rộng';
//     } else {
//         toggleButton.textContent = 'Thu gọn';
//     }
// }
