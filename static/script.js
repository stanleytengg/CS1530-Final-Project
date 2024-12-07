document.addEventListener('DOMContentLoaded', function() {
    // Gets the expense form
    const expenseForm = document.getElementById('add-expenses-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', submitExpense);
    }
});

async function submitExpense(e) {
    e.preventDefault();
    
    const expenseID = document.getElementById('new-expense');
    const formData = new FormData();
    formData.append('add-expense', expenseID.value);

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

function updateExpenseList(data) {
    const expenseList = document.getElementById('expense-list');
    if (expenseList) {
        const expenseElement = document.createElement('div');
        expenseElement.className = 'expense-item';
        expenseElement.innerHTML = `
            <span class="expense-amount">$${data.expense.toFixed(2)}</span>
            <span class="expense-id">#${data.id}</span>
        `;
        expenseList.prepend(expenseElement);
    }
}

function showMessage(message) {
    // Creates a message container
    messageContainer = document.createElement('div');
    messageContainer.id = 'message-container';
    document.body.prepend(messageContainer);

    // Creates the div container
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.textContent = message;

    // Shows the message
    messageContainer.appendChild(messageElement);

    // Removes the message after 2 seconds
    setTimeout(() => {
        messageElement.remove();
        messageContainer.remove();
    }, 1000);
}