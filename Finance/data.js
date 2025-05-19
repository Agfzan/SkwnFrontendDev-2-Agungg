const FinanceApp = {
    defaultData: {
        user: {
            name: "Aurellia",
            profileImage: "https://randomuser.me/api/portraits/women/65.jpg"
        },
        balance: 25550000,
        lastUpdated: "12 June 2022",
        cards: [
            {
                id: "card1",
                number: "4000 5127 2123 2018",
                type: "premium",
                name: "Aurellia",
                brand: "VISA"
            },
            {
                id: "card2",
                number: "4000 5128 2124 2019",
                type: "regular",
                name: "Aurellia",
                brand: "VISA"
            },
            {
                id: "card3",
                number: "4000 5129 2125 2020",
                type: "gold",
                name: "Aurellia",
                brand: "VISA"
            },
            {
                id: "card4",
                number: "4000 5130 2126 2021",
                type: "platinum",
                name: "Aurellia",
                brand: "VISA"
            }
        ],
        transactions: [
            {
                id: "trans1",
                type: "deposit",
                amount: 15510000,
                date: "11 March 2022",
                time: "11:21 AM",
                location: "Bank Mandiri ATM",
                category: "deposit"
            },
            {
                id: "trans2",
                type: "withdraw",
                amount: 15510000,
                date: "11 March 2022",
                time: "11:22 AM",
                location: "Bank Mandiri ATM",
                category: "withdraw"
            },
            {
                id: "trans3",
                type: "withdraw",
                amount: 5250000,
                date: "10 March 2022",
                time: "10:45 AM",
                location: "Bank BCA ATM",
                category: "withdraw"
            },
            {
                id: "trans4",
                type: "deposit",
                amount: 8700000,
                date: "8 March 2022",
                time: "14:30 PM",
                location: "Bank BRI ATM",
                category: "deposit"
            },
            {
                id: "trans5",
                type: "transfer",
                amount: 3500000,
                date: "5 March 2022",
                time: "09:15 AM",
                location: "Mobile Banking",
                recipient: "John Doe",
                category: "transfer"
            }
        ],
        monthlyStats: {
            "Jan": 2500000,
            "Feb": 4500000,
            "Mar": 2800000,
            "Apr": 4200000,
            "May": 5000000
        }
    },

    init: function() {
        if (!localStorage.getItem('financeAppData')) {
            localStorage.setItem('financeAppData', JSON.stringify(this.defaultData));
        }
        return this.getData();
    },

    getData: function() {
        return JSON.parse(localStorage.getItem('financeAppData'));
    },

    saveData: function(data) {
        localStorage.setItem('financeAppData', JSON.stringify(data));
    },

    getUser: function() {
        return this.getData().user;
    },

    getBalance: function() {
        return this.getData().balance;
    },

    getLastUpdated: function() {
        return this.getData().lastUpdated;
    },

    updateBalance: function(newBalance) {
        const data = this.getData();
        data.balance = newBalance;
        data.lastUpdated = this.formatCurrentDate();
        this.saveData(data);
        return newBalance;
    },

    getCards: function() {
        return this.getData().cards;
    },

    getTransactions: function() {
        return this.getData().transactions;
    },

    getTransactionsByCategory: function(category) {
        if (category === 'all') {
            return this.getTransactions();
        }
        return this.getTransactions().filter(transaction => transaction.category === category);
    },

    addTransaction: function(transaction) {
        const data = this.getData();
        
        transaction.id = 'trans' + (data.transactions.length + 1);
        
        if (transaction.type === 'deposit') {
            data.balance += transaction.amount;
        } else if (transaction.type === 'withdraw' || transaction.type === 'transfer') {
            data.balance -= transaction.amount;
        }
        
        data.lastUpdated = this.formatCurrentDate();
        
        data.transactions.unshift(transaction);
        
        this.saveData(data);
        
        return transaction;
    },

    getMonthlyStats: function() {
        return this.getData().monthlyStats;
    },

    updateMonthlyStat: function(month, amount) {
        const data = this.getData();
        data.monthlyStats[month] = amount;
        this.saveData(data);
        return data.monthlyStats;
    },

    formatCurrentDate: function() {
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                        'July', 'August', 'September', 'October', 'November', 'December'];
        const now = new Date();
        return `${now.getDate()} ${months[now.getMonth()]} ${now.getFullYear()}`;
    },
    
    formatCurrency: function(amount) {
        return 'Rp' + amount.toLocaleString('id-ID') + ',-';
    },
    
    resetData: function() {
        localStorage.setItem('financeAppData', JSON.stringify(this.defaultData));
        return this.getData();
    }
};

document.addEventListener('DOMContentLoaded', function() {
    FinanceApp.init();
}); 
