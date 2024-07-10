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

        //Xóa nhiều bản ghỉ:

        //Close dialog
        document.querySelector("#btnCloseDialog").addEventListener('click', this.btnCloseDialog)

        //Lưu nhân viên

        //Đóng mở Navbar
        document.querySelector("#toggleNavbar").addEventListener('click', this.toggleNavbar)

        
        } catch (error) {
            console.error(erro);
            
        }
      
    }
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

    btnRefreshOnclick(){
        try {

        } catch (error) {
            console.error(erro);
        }
    }


    btnCloseDialog(){
        try {
            const dialog = document.getElementById("dlgDialog");
            dialog.style.visibility="hidden";
            
        } catch (error) {
            console.error(erro);
        }
    }


    toggleNavbar(){
        try {

            var navbar = document.querySelector('.navbar');
            navbar.classList.toggle('collapsed');
            
            // Thay đổi nội dung nút
            var toggleButton = document.querySelector('.toggle-button span');
            if (navbar.classList.contains('collapsed')) {
                toggleButton.textContent = 'Mở rộng';
            } else {
                toggleButton.textContent = 'Thu gọn';
            }
            
        } catch (error) {
            console.error(erro);
        }
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
