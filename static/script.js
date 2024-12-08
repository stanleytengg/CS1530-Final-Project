document.addEventListener('DOMContentLoaded', async function() {
    // Finds elements
    const expenseForm = document.getElementById('add-expenses-form');
    const nextDayBtn = document.getElementById('next-day-btn');
    const expenseList = document.getElementById('expense-list');
    const expenseChart = document.getElementById('expense-chart');
    const budgetForm = document.getElementById('set-budget-form');
    
    // Adds event listeners if elements exist
    if (expenseForm) expenseForm.addEventListener('submit', submitExpense);
    if (nextDayBtn) nextDayBtn.addEventListener('click', nextDay);
    if (expenseList) {
        const expenses = await getAllExpenses();
        expenses.forEach(function (expense) {
            updateExpenseList(expense);
        });
    }
    if (expenseChart) showChart();
    if (budgetForm) budgetForm.addEventListener('submit', submitBudget);
});

const submitBudget = async (e) => {
    e.preventDefault();

    const budgetID = document.getElementById('new-budget');
    const formData = new FormData();
    formData.append('set-budget', budgetID.value);

    const response = await fetch('/set-budget', {
        method: 'POST',
        body: formData
    });
    
    // Updates list and shows message if response and data is working
    updateBudget();

    // Clears the input field
    budgetID.value = '';
}

const updateBudget = () => {
    fetch('get-budget', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        }
    })
    .then(response => {
        if (!response.ok) {
            const budgetDisplay = document.getElementById('budget-display');
            if (budgetDisplay) {
                budgetDisplay.innerText = `Budget: Not Set`;  // Update with the fetched budget value
            }
        }
        return response.json();  // Parse the JSON response
    })
    .then(data => {
        const budgetDisplay = document.getElementById('budget-display');
        if (budgetDisplay) {
            budgetDisplay.innerText = `Budget: $${data.budget.toFixed(2)}`;  // Update with the fetched budget value
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

async function submitExpense(e) {
    e.preventDefault();
    
    // Loads expense amount into FormData object
    const expenseID = document.getElementById('new-expense');
    const formData = new FormData();
    formData.append('add-expense', expenseID.value);

    // Sends POST request and parse the response
    const response = await fetch('/add-expense', {
        method: 'POST',
        body: formData
    });
    const data = await response.json();

    // Updates list and shows message if response and data is working
    if (response.ok && data) {
        updateExpenseList(data);
        showMessage('Expense added successfully!');
    }

    updateBudget()

    // Clears the input field
    expenseID.value = '';
}

async function nextDay() {
    // Sends POST request and parse the response
    const response = await fetch('/next-day', {
        method: 'POST'
    });
    const data = await response.json();

    // Update the day display if response and data is working
    if (response.ok && data) {
        const currentDayID = document.getElementById('current-day');
        currentDayID.textContent = data.day;
    }
}

async function getAllExpenses() {
    // Sends GET request and parse the response
    const response = await fetch('/get_all_expenses', {
        method: 'GET'
    });
    const data = await response.json();

    return data;
}

function updateExpenseList(data) {
    // Find element
    const expenseList = document.getElementById('expense-list');

    // Needs to return immediately if expense list doesn't exists
    if (!expenseList) return;

    // Add element in expense list
    const expenseElement = document.createElement('div');
    expenseElement.className = 'expense-item';
    expenseElement.innerHTML = `
        <span class="expense-day">Day ${data.day_id}</span>
        <span class="expense-amount">$${data.expense.toFixed(2)}</span>
    `;
    expenseList.prepend(expenseElement);
}

function showMessage(message) {
    // Creates a message container
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    document.body.prepend(messageContainer);

    // Creates the div container
    const messageElement = document.createElement('div');
    messageElement.className = 'add-expense-message';
    messageElement.textContent = message;

    // Shows the message
    messageContainer.appendChild(messageElement);

    // Removes the message after 1 seconds
    setTimeout(() => {
        messageElement.remove();
        messageContainer.remove();
    }, 1000);
}

function sumTotals(dailyTotals, expense) {
    // Set total to 0 if it's first expense for the day
    if (!dailyTotals[expense.day_id]) dailyTotals[expense.day_id] = 0;

    // Add current expense to day's total
    dailyTotals[expense.day_id] += expense.expense;

    return dailyTotals;
}

async function getDailyTotals() {
    // Get all expenses
    const expenses = await getAllExpenses();

    // Reduce expenses array into a dictionary of daily totals
    const dailyTotals = expenses.reduce(sumTotals, {});

    // Puts days as an array
    const days = Object.keys(dailyTotals);

    // Create array of corresponding total amounts
    const totals = days.map(day => dailyTotals[day]);

    return {days, totals};
}

async function showChart() {
    // Gets the canvas context for drawing the chart
    const chart = document.getElementById('expense-chart').getContext('2d');
    const data = await getDailyTotals();

    // Create new Chart.js chart
    new Chart(chart, {
        type: 'line',
        data: {
            labels: data.days.map(day => `Day ${day}`),
            datasets: [{
                label: 'Daily Total Expenses',
                data: data.totals,
                borderColor: '#5e503f',
                backgroundColor: '#5e503f1a',
                borderWidth: 2,
                fill: true,
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Daily Expenses Overview',
                    font: {
                        size: 16
                    }
                },
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Day'
                    }
                }
            }
        }
    });
}

const updateNotifications = () => {
    fetch('/get-notification')
    .then(response => response.json())
    .then(data => {
        if (data.notifications) {
            const notificationList = document.getElementById('notification-list');
            notificationList.innerHTML = '';


            data.notifications.forEach(notification => {
                const notificationItem = document.createElement('div');
                notificationItem.classList.add('notification-item');

                notificationItem.innerHTML = `
                    <h4>${notification.title}</h4>
                    <p>${notification.message}</p>
                    <small>Created at: ${notification.created_at}</small>
                `;
                notificationList.appendChild(notificationItem);
            });
        } else {
            // If no notifications are found
            notificationList.innerHTML = '<p>No notifications found.</p>';
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}