document.addEventListener('DOMContentLoaded', function() {
    const expenseForm = document.getElementById('add-expenses-form');
    expenseForm.addEventListener('submit', submitExpense);

    const nextDayBtn = document.getElementById('next-day-btn');
    nextDayBtn.addEventListener('click', nextDay);
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