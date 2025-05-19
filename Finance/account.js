$(document).ready(function() {
    FinanceApp.init();
    
    loadAccountData();
    
    initAccountAnimations();
    
    initFinanceChart();
    
    $('.filter').click(function() {
        showFilterOptions();
    });
    
    $('.month').click(function() {
        $('.month').removeClass('active');
        $(this).addClass('active');
        updateChartForSelectedMonth($(this).text());
    });
    
    $('#add-transaction-btn').click(function() {
        showAddTransactionForm();
    });
});

function loadAccountData() {
    const balance = FinanceApp.getBalance();
    const lastUpdated = FinanceApp.getLastUpdated();
    
    $('.account-balance h2').text(FinanceApp.formatCurrency(balance));
    $('.account-balance .date').text(lastUpdated);
    
    loadTransactions();
}

function loadTransactions() {
    const transactions = FinanceApp.getTransactions();
    const activityList = $('.activity-list');
    
    activityList.empty();
    
    transactions.forEach(transaction => {
        const transactionHtml = `
            <div class="activity-item ${transaction.type}" data-id="${transaction.id}">
                <div class="activity-icon">
                    <i class="fas fa-arrow-${transaction.type === 'deposit' ? 'up' : 'down'}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-main">
                        <div>
                            <h3>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h3>
                            <p class="amount ${transaction.type}-amount">${FinanceApp.formatCurrency(transaction.amount)}</p>
                        </div>
                        <div class="activity-date">
                            <p>${transaction.date}</p>
                            <p class="time">${transaction.time}</p>
                        </div>
                    </div>
                    <div class="activity-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${transaction.location}</span>
                    </div>
                </div>
            </div>
        `;
        
        activityList.append(transactionHtml);
    });
    
    $('.activity-item').click(function() {
        const transactionId = $(this).data('id');
        showTransactionDetails(transactionId);
    });
}

function initAccountAnimations() {
    $('.account-header').css('opacity', 0).animate({opacity: 1}, 500, function() {
        $('.statistics-section').css('opacity', 0).animate({opacity: 1}, 500, function() {
            $('.history-section').css('opacity', 0).animate({opacity: 1}, 500);
        });
    });
}

function initFinanceChart() {
    const ctx = document.getElementById('financeChart').getContext('2d');
    
    const monthlyStats = FinanceApp.getMonthlyStats();
    const months = Object.keys(monthlyStats);
    const data = months.map(month => monthlyStats[month]);
    
    const config = {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: 'Balance',
                data: data,
                borderColor: '#0095ff',
                backgroundColor: 'rgba(0, 149, 255, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#0095ff',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: {
                        size: 14
                    },
                    bodyFont: {
                        size: 13
                    },
                    callbacks: {
                        label: function(context) {
                            let value = context.raw;
                            if (value >= 1000000) {
                                return 'Rp' + (value / 1000000).toFixed(1) + 'M';
                            } else {
                                return 'Rp' + value.toLocaleString();
                            }
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    min: 1000000,
                    max: 5500000
                }
            },
            elements: {
                point: {
                    radius: function(context) {
                        return context.dataIndex === 2 ? 6 : 0;
                    }
                }
            }
        }
    };
    
    window.financeChart = new Chart(ctx, config);
    
    highlightChartPoint(2);
}

function highlightChartPoint(index) {
    const canvas = document.getElementById('financeChart');
    const ctx = canvas.getContext('2d');
    const chart = window.financeChart;
    
    const originalDraw = chart.draw;
    chart.draw = function() {
        originalDraw.apply(this, arguments);
        
        if (chart.data.datasets.length > 0) {
            const dataset = chart.data.datasets[0];
            const meta = chart.getDatasetMeta(0);
            
            if (meta.data.length > index) {
                const selectedPoint = meta.data[index];
                
                ctx.save();
                ctx.beginPath();
                ctx.setLineDash([5, 5]);
                ctx.strokeStyle = 'rgba(0, 149, 255, 0.5)';
                ctx.moveTo(selectedPoint.x, selectedPoint.y);
                ctx.lineTo(selectedPoint.x, canvas.height - 30);
                ctx.stroke();
                ctx.restore();
            }
        }
    };
    
    chart.update();
}

function showFilterOptions() {
    const options = ['All', 'Deposit', 'Withdraw', 'Transfer', 'Payment'];
    
    const popup = $('<div class="filter-popup"></div>');
    
    popup.css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'background-color': 'white',
        'border-radius': '15px',
        'box-shadow': '0 5px 25px rgba(0, 0, 0, 0.2)',
        'padding': '20px',
        'z-index': '1000',
        'min-width': '250px'
    });
    
    popup.append('<h3 style="margin-bottom:15px;text-align:center;font-size:18px">Select Category</h3>');
    
    options.forEach(option => {
        const optionItem = $(`<div class="filter-option">${option}</div>`);
        
        optionItem.css({
            'padding': '12px 15px',
            'border-bottom': '1px solid #f0f0f0',
            'cursor': 'pointer'
        });
        
        optionItem.hover(
            function() { $(this).css('background-color', '#f9f9f9'); },
            function() { $(this).css('background-color', 'white'); }
        );
        
        optionItem.click(function() {
            $('.filter span').text(option);
            filterTransactions(option.toLowerCase());
            closePopup();
        });
        
        popup.append(optionItem);
    });
    
    const closeButton = $('<button class="close-btn">Cancel</button>');
    
    closeButton.css({
        'display': 'block',
        'width': '100%',
        'padding': '12px',
        'margin-top': '15px',
        'background-color': '#f0f0f0',
        'border': 'none',
        'border-radius': '10px',
        'font-size': '16px',
        'cursor': 'pointer'
    });
    
    closeButton.click(closePopup);
    
    popup.append(closeButton);
    
    const backdrop = $('<div class="backdrop"></div>');
    
    backdrop.css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'background-color': 'rgba(0, 0, 0, 0.5)',
        'z-index': '999'
    });
    
    backdrop.click(closePopup);
    
    $('body').append(backdrop).append(popup);
    
    function closePopup() {
        popup.remove();
        backdrop.remove();
    }
}

function filterTransactions(category) {
    const transactions = FinanceApp.getTransactionsByCategory(category);
    const activityList = $('.activity-list');
    
    activityList.empty();
    
    transactions.forEach(transaction => {
        const transactionHtml = `
            <div class="activity-item ${transaction.type}" data-id="${transaction.id}">
                <div class="activity-icon">
                    <i class="fas fa-arrow-${transaction.type === 'deposit' ? 'up' : 'down'}"></i>
                </div>
                <div class="activity-info">
                    <div class="activity-main">
                        <div>
                            <h3>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h3>
                            <p class="amount ${transaction.type}-amount">${FinanceApp.formatCurrency(transaction.amount)}</p>
                        </div>
                        <div class="activity-date">
                            <p>${transaction.date}</p>
                            <p class="time">${transaction.time}</p>
                        </div>
                    </div>
                    <div class="activity-location">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${transaction.location}</span>
                    </div>
                </div>
            </div>
        `;
        
        activityList.append(transactionHtml);
    });
    
    $('.activity-item').click(function() {
        const transactionId = $(this).data('id');
        showTransactionDetails(transactionId);
    });
}

function updateChartForSelectedMonth(month) {
    const months = Object.keys(FinanceApp.getMonthlyStats());
    const monthIndex = months.indexOf(month);
    
    if (monthIndex !== -1) {
        window.financeChart.options.elements.point.radius = function(context) {
            return context.dataIndex === monthIndex ? 6 : 0;
        };
        
        window.financeChart.update();
        
        highlightChartPoint(monthIndex);
    }
}

function showTransactionDetails(transactionId) {
    const transaction = FinanceApp.getTransactions().find(t => t.id === transactionId);
    
    if (!transaction) return;
    
    const popup = $('<div class="transaction-popup"></div>');
    
    popup.css({
        'position': 'fixed',
        'top': '50%',
        'left': '50%',
        'transform': 'translate(-50%, -50%)',
        'background-color': 'white',
        'border-radius': '15px',
        'box-shadow': '0 5px 25px rgba(0, 0, 0, 0.2)',
        'padding': '20px',
        'z-index': '1000',
        'min-width': '300px',
        'max-width': '90%'
    });
    
    const content = `
        <h3 style="margin-bottom:15px;font-size:18px;text-align:center">Transaction Details</h3>
        <div style="margin-bottom:15px">
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Type:</span>
                <span>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Amount:</span>
                <span>${FinanceApp.formatCurrency(transaction.amount)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Date:</span>
                <span>${transaction.date} ${transaction.time}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Location:</span>
                <span>${transaction.location}</span>
            </div>
            ${transaction.recipient ? `
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Recipient:</span>
                <span>${transaction.recipient}</span>
            </div>
            ` : ''}
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Category:</span>
                <span>${transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1)}</span>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:10px">
                <span style="font-weight:bold">Transaction ID:</span>
                <span>${transaction.id}</span>
            </div>
        </div>
    `;
    
    popup.append(content);
    
    const closeButton = $('<button class="close-btn">Close</button>');
    
    closeButton.css({
        'display': 'block',
        'width': '100%',
        'padding': '12px',
        'background-color': '#f0f0f0',
        'border': 'none',
        'border-radius': '10px',
        'font-size': '16px',
        'cursor': 'pointer'
    });
    
    closeButton.click(function() {
        popup.remove();
        backdrop.remove();
    });
    
    popup.append(closeButton);
    
    const backdrop = $('<div class="backdrop"></div>');
    
    backdrop.css({
        'position': 'fixed',
        'top': '0',
        'left': '0',
        'right': '0',
        'bottom': '0',
        'background-color': 'rgba(0, 0, 0, 0.5)',
        'z-index': '999'
    });
    
    backdrop.click(function() {
        popup.remove();
        backdrop.remove();
    });
    
    $('body').append(backdrop).append(popup);
} 