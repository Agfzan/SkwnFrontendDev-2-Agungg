$(document).ready(function() {
    FinanceApp.init();
    
    loadUserData();
    
    initAnimations();
    
    loadTransactionData();
    
    initCardSlider();
    
    $('.service-item').click(function() {
        const serviceName = $(this).find('p').text();
        handleServiceClick(serviceName);
    });
    
    $('.nav-item').click(function(e) {
        if ($(this).attr('href') !== '#' && !$(this).hasClass('active')) {
        }
        
        e.preventDefault();
        $('.nav-item').removeClass('active');
        $(this).addClass('active');
        
        if ($(this).find('i').hasClass('fa-home') && window.location.href.includes('account.html')) {
            window.location.href = 'index.html';
        }
    });
    
    if ($('#add-transaction-btn').length) {
        $('#add-transaction-btn').click(function() {
            showAddTransactionForm();
        });
    }
});

function loadUserData() {
    const user = FinanceApp.getUser();
    
    $('.greeting h1').text(user.name + '!');
    
    $('.profile-pic img').attr('src', user.profileImage);
    
    loadCardData();
}

function loadCardData() {
    const cards = FinanceApp.getCards();
    const cardsContainer = $('.cards-slider');
    
    cardsContainer.empty();
    
    cards.forEach(card => {
        const cardHtml = `
            <div class="card ${card.type}">
                <div class="chip-icon">
                    <i class="fas fa-credit-card"></i>
                </div>
                <div class="card-number">${card.number}</div>
                <div class="card-info">
                    <span class="card-name">${card.name}</span>
                    <span class="card-brand">${card.brand}</span>
                </div>
                ${card.type !== 'regular' ? `<div class="card-label">${card.type.charAt(0).toUpperCase() + card.type.slice(1)}</div>` : ''}
            </div>
        `;
        
        cardsContainer.append(cardHtml);
    });
}

function initAnimations() {
    $('.greeting').css('opacity', 0).animate({opacity: 1}, 500, function() {
        $('.card-section').css('opacity', 0).animate({opacity: 1}, 500, function() {
            $('.services-section').css('opacity', 0).animate({opacity: 1}, 500, function() {
                $('.activity-section').css('opacity', 0).animate({opacity: 1}, 500);
            });
        });
    });
    
    $('.card, .service-icon, .activity-item').hover(
        function() {
            $(this).css('transform', 'translateY(-3px)');
            $(this).css('box-shadow', '0 6px 20px rgba(0, 0, 0, 0.1)');
        },
        function() {
            $(this).css('transform', 'translateY(0)');
            $(this).css('box-shadow', '0 2px 8px rgba(0, 0, 0, 0.05)');
        }
    );
}

function loadTransactionData() {
    const transactions = FinanceApp.getTransactions().slice(0, 5); // Get first 5 transactions
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

function initCardSlider() {
    positionCards();
    
    $('.card').click(function() {
        const cardsSlider = $('.cards-slider');
        const cardWidth = $(this).outerWidth(true);
        const currentScroll = cardsSlider.scrollLeft();
        
        cardsSlider.animate({
            scrollLeft: currentScroll + cardWidth
        }, 300);
    });
    
    $(window).resize(function() {
        positionCards();
    });
    
    let startX, moveX;
    
    $('.cards-slider').on('touchstart', function(e) {
        startX = e.originalEvent.touches[0].pageX;
    });
    
    $('.cards-slider').on('touchmove', function(e) {
        moveX = e.originalEvent.touches[0].pageX;
    });
    
    $('.cards-slider').on('touchend', function(e) {
        if (startX && moveX) {
            const diff = startX - moveX;
            const cardWidth = $('.card').outerWidth(true);
            
            if (Math.abs(diff) > 50) {
                if (diff > 0) {
                    $(this).animate({
                        scrollLeft: $(this).scrollLeft() + cardWidth
                    }, 300);
                } else {
                    $(this).animate({
                        scrollLeft: $(this).scrollLeft() - cardWidth
                    }, 300);
                }
            }
        }
        
        startX = null;
        moveX = null;
    });
        $('.cards-slider').on('scroll', function() {
        clearTimeout($.data(this, 'scrollTimer'));
        $.data(this, 'scrollTimer', setTimeout(function() {
            const cardsSlider = $('.cards-slider');
            const cardWidth = $('.card').outerWidth(true);
            const scrollLeft = cardsSlider.scrollLeft();
            const snapTo = Math.round(scrollLeft / cardWidth) * cardWidth;
            
            cardsSlider.animate({
                scrollLeft: snapTo
            }, 200);
        }, 200));
    });
}

function positionCards() {
    const containerWidth = $('.container').width();
    const cardWidth = $('.card').outerWidth(true);
    const visibleWidth = containerWidth - 60;
    if (cardWidth < 280) {
        $('.card').css('min-width', '280px');
    }
    
    if (cardWidth > visibleWidth) {
    } else {
        $('.card').css('min-width', (visibleWidth * 0.85) + 'px');
    }
}

function handleServiceClick(serviceName) {
    if (serviceName === 'Finance') {
        return;
    }

    const message = `${serviceName} service selected`;

    const notification = $('<div class="notification"></div>').text(message);
 
    notification.css({
        'position': 'fixed',
        'bottom': '80px',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'background-color': '#333',
        'color': 'white',
        'padding': '10px 20px',
        'border-radius': '20px',
        'z-index': '1000',
        'opacity': '0',
        'text-align': 'center'
    });

    $('body').append(notification);
    notification.animate({opacity: 1}, 300).delay(2000).animate({opacity: 0}, 300, function() {
        $(this).remove();
    });
}

function showAddTransactionForm() {
    const popup = $('<div class="transaction-form-popup"></div>');

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

    const formContent = `
        <h3 style="margin-bottom:15px;font-size:18px;text-align:center">Add New Transaction</h3>
        <form id="new-transaction-form">
            <div style="margin-bottom:15px">
                <label style="display:block;margin-bottom:5px;font-weight:500">Transaction Type:</label>
                <select id="transaction-type" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd">
                    <option value="deposit">Deposit</option>
                    <option value="withdraw">Withdraw</option>
                    <option value="transfer">Transfer</option>
                    <option value="payment">Payment</option>
                </select>
            </div>
            
            <div style="margin-bottom:15px">
                <label style="display:block;margin-bottom:5px;font-weight:500">Amount (Rp):</label>
                <input type="number" id="transaction-amount" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd" required>
            </div>
            
            <div style="margin-bottom:15px">
                <label style="display:block;margin-bottom:5px;font-weight:500">Location:</label>
                <input type="text" id="transaction-location" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd" required placeholder="e.g., Bank ATM, Mobile Banking">
            </div>
            
            <div id="recipient-field" style="margin-bottom:15px;display:none">
                <label style="display:block;margin-bottom:5px;font-weight:500">Recipient:</label>
                <input type="text" id="transaction-recipient" style="width:100%;padding:10px;border-radius:8px;border:1px solid #ddd" placeholder="Recipient Name">
            </div>
            
            <div style="display:flex;gap:10px;margin-top:20px">
                <button type="button" id="cancel-transaction" style="flex:1;padding:12px;background-color:#f0f0f0;border:none;border-radius:10px;font-size:16px;cursor:pointer">Cancel</button>
                <button type="submit" style="flex:1;padding:12px;background-color:#0095ff;color:white;border:none;border-radius:10px;font-size:16px;cursor:pointer">Add</button>
            </div>
        </form>
    `;
    
    popup.append(formContent);

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

    $('body').append(backdrop).append(popup);

    $('#transaction-type').change(function() {
        if ($(this).val() === 'transfer') {
            $('#recipient-field').show();
        } else {
            $('#recipient-field').hide();
        }
    });
        $('#cancel-transaction').click(function() {
        popup.remove();
        backdrop.remove();
    });
    
    $('#new-transaction-form').submit(function(e) {
        e.preventDefault();
        
        const type = $('#transaction-type').val();
        const amount = parseFloat($('#transaction-amount').val());
        const location = $('#transaction-location').val();
        const recipient = $('#transaction-recipient').val();
        
        if (!amount || isNaN(amount) || amount <= 0) {
            alert('Please enter a valid amount');
            return;
        }
        
        if (!location) {
            alert('Please enter a location');
            return;
        }
        
        if (type === 'transfer' && !recipient) {
            alert('Please enter a recipient for the transfer');
            return;
        }
    
        const now = new Date();
        const hours = now.getHours();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = (hours % 12) || 12;
        
        const transaction = {
            type: type,
            amount: amount,
            location: location,
            date: FinanceApp.formatCurrentDate(),
            time: `${displayHours}:${minutes} ${ampm}`,
            category: type
        };
        
        if (type === 'transfer') {
            transaction.recipient = recipient;
        }
        
        FinanceApp.addTransaction(transaction);
        
        if (window.location.href.includes('account.html')) {
            loadAccountData();
            updateChart();
        } else {
            loadTransactionData();
        }
        
        popup.remove();
        backdrop.remove();
        
        showNotification('Transaction added successfully');
    });
}

function showNotification(message) {
    const notification = $('<div class="notification"></div>').text(message);
    
    notification.css({
        'position': 'fixed',
        'bottom': '80px',
        'left': '50%',
        'transform': 'translateX(-50%)',
        'background-color': '#4CAF50',
        'color': 'white',
        'padding': '10px 20px',
        'border-radius': '20px',
        'z-index': '1000',
        'opacity': '0',
        'text-align': 'center'
    });
    
    $('body').append(notification);
    notification.animate({opacity: 1}, 300).delay(2000).animate({opacity: 0}, 300, function() {
        $(this).remove();
    });
}

function getMonthName(monthIndex) {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
}

function padZero(num) {
    return num < 10 ? '0' + num : num;
} 