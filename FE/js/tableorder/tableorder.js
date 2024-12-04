// Danh sách bàn mẫu (sau này sẽ lấy từ API)
const tables = [
    { id: 1, number: 'A1', seats: 4, status: 'available' },
    { id: 2, number: 'A2', seats: 4, status: 'available' },
    { id: 3, number: 'A3', seats: 6, status: 'available' },
    { id: 4, number: 'B1', seats: 4, status: 'available' },
    { id: 5, number: 'B2', seats: 4, status: 'available' },
    { id: 6, number: 'B3', seats: 8, status: 'available' }
];

// Render danh sách bàn
function renderTables() {
    const tableGrid = document.getElementById('tableGrid');
    tableGrid.innerHTML = ''; // Xóa bỏ nội dung cũ

    tables.forEach(table => {
        const tableElement = document.createElement('div');
        tableElement.classList.add('table-item');
        tableElement.classList.add(table.status === 'available' ? 'table-available' : 'table-occupied');
        
        tableElement.innerHTML = `
            <div class="table-number">${table.number}</div>
            <div class="table-seats">${table.seats} chỗ</div>
        `;

        // Sự kiện click để thay đổi trạng thái bàn
        tableElement.addEventListener('click', () => {
            toggleTableStatus(table);
        });

        tableGrid.appendChild(tableElement);
    });
}

// Thay đổi trạng thái bàn
function toggleTableStatus(table) {
    table.status = table.status === 'available' ? 'occupied' : 'available';
    renderTables();
}

// Khởi tạo
document.addEventListener('DOMContentLoaded', renderTables);
