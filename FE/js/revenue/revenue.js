$(document).ready(function () {
    // Biến toàn cục để lưu trữ đối tượng biểu đồ
    let revenueChart;

    // Load dữ liệu doanh thu
    function loadRevenueData(dateRange = 7) {
        $.ajax({
            url: `http://localhost:5014/api/v1/Revenue?days=${dateRange}`,
            type: 'GET',
            success: function (data) {
                // Tổng doanh thu
                $('#totalRevenue').text(`${data.totalRevenue.toLocaleString()} đ`);

                // Cập nhật lợi nhuận hôm nay
                $('#todayProfit').text(`${data.todayProfit.toLocaleString()} đ`);

                // Cập nhật số đơn order hôm nay
                $('#todayOrders').text(data.todayOrders);

                // Cập nhật số món order hôm nay
                 $('#todayOrdersFood').text(data.todayOrdersFood);

                // Cập nhật top 3 món ăn
                let topFoods = data.topFoods;
                const topFoodsList = $('#topFoods');
                topFoodsList.empty();
                topFoods.forEach(food => {
                    topFoodsList.append(
                        `<li>${food.Name} - ${food.Revenue.toLocaleString()} đ</li>`
                    );
                });

                // Cập nhật biểu đồ doanh thu
                renderRevenueChart(data.revenueChart);
            },
            error: function (error) {
                console.error("Lỗi khi tải dữ liệu doanh thu:", error);
            }
        });
    }

    function renderRevenueChart(chartData) {
        const ctx = $('#revenueChart')[0];  // Lấy canvas element
    
        // Kiểm tra nếu biểu đồ đã tồn tại thì hủy nó
        if (revenueChart) {
            revenueChart.destroy();
        }
    
        // Tạo mới biểu đồ
        revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Doanh thu',
                    data: chartData.data,
                    borderColor: '#019160',
                    backgroundColor: 'rgba(0, 73, 153, 0.1)', // Thêm màu nền nhẹ
                    borderWidth: 3,
                    fill: true, // Cho phép tô màu dưới đường
                    tension: 0.4 // Làm đường cong mượt mà hơn
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false, // Quan trọng để biểu đồ full kích thước
                plugins: {
                    legend: {
                        display: true,
                        position: 'top'
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        callbacks: {
                            label: function(context) {
                                let value = context.parsed.y;
                                return `Doanh thu: ${value.toLocaleString()} đ`;
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString() + ' đ';
                            }
                        },
                        grid: {
                            color: 'rgba(0,0,0,0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    mode: 'nearest',
                    axis: 'x',
                    intersect: false
                }
            }
        });
    }
    

    // Thay đổi khoảng thời gian
    $('#dateRange').on('change', function () {
        const selectedRange = $(this).val();
        loadRevenueData(selectedRange);  // Load lại dữ liệu với khoảng thời gian mới
    });

    // Load dữ liệu mặc định
    loadRevenueData();
});
