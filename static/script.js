document.addEventListener('DOMContentLoaded', async function() {
        const expenseForm = document.getElementById('add-expenses-form');
        expenseForm.addEventListener('submit', submitExpense);
    
        const nextDayBtn = document.getElementById('next-day-btn');
        nextDayBtn.addEventListener('click', nextDay);
    
        const expenses = await getAllExpenses();
        expenses.forEach(function (expense) {
            updateExpenseList(expense);
        });
    });
    
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
    // Add element in expense list
    const expenseList = document.getElementById('expense-list');
    const expenseElement = document.createElement('div');
    expenseElement.className = 'expense-item';
    expenseElement.innerHTML = `
        <span class="expense-day">Day ${data.day_id}</span>
        <span class="expense-amount">$${data.expense.toFixed(2)}</span>
    `;
    expenseList.prepend(expenseElement);
}

