window.onload = function(){
    new EmployeePage();
}


class EmployeePage{
    pageTitle = "Quản lý nhân viên";
    constructor(){
        console.log("Constuctor...");
        this.initEvens();
    }

   /* Khới tạo các sự kiện trong page 4
    *Author: TQHuy (10/7/2024) */

    initEvens(){
        try {
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

        //Lưu nhân viên

        //Đóng mở Navbar
        document.querySelector("#toggleNavbar").addEventListener('click', this.toggleNavbar)

        // Thông báo có xáo hay không
        document.querySelector("#btnDeleteEmployee").addEventListener('click', this.showNotice )

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
    showNotice() {
        try {
            // Hiển thị form thêm mới
            // 1. Lấy ra elêmnt của form thêm mới
            const dialog = document.getElementById("dlgNotice");
            dialog.style.visibility="visible";
            // 2. Set hiển thị form

 
        } catch (error) {
            console.error("Không hiện thông báo được ...");
        }   
    }


    //Thêm mới nhần viên
    addEmployee(){
        try {

            //Thực hiện Validda đữ liệu
            const error= this.validateData();

            //Hiển thị thông báo nếu dữ liệu chưa hợp lệ
            if(error.IsValid===false){
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
                for(const Msg of error.Msg){
                    let li = document.createElement("li");
                    li.textContent=Msg;
                    errorElement.append(li);

                }

            }else{
            //Nếu dữ liệu hợp lệ thì gọi API để thực hiện thêm mới

            }
            
        } catch (error) {
            console.error("Không thêm mới được nhân viên");
            
        }
    }
    validateData() {
        let error = {
            IsValid: false,
            Msg: []
        };

        // Kiểm tra có mã nhân viên chưa
        const customerCode = document.querySelector(".A").value;
        const fullName = document.querySelector(".B").value;
    
        if (customerCode == "" || customerCode == null || customerCode == undefined) {
            // Lưu thông tin lỗi:
            error.Msg.push("Mã nhân viên không được phép để trống");
        }
    
        if (fullName == "" || fullName == null || fullName == undefined) {
            // Kiểm tra có họ tên chưa
            error.Msg.push("Họ và tên không được phép để trống");
        }
    
        if (error.Msg.length === 0) {
            error.IsValid = true;
        }
    
        console.log(error.IsValid);
    
        return error;
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
