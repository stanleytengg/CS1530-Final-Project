document.addEventListener('DOMContentLoaded', function() {
    // Gets the expense form
    const expenseForm = document.getElementById('add-expenses-form');
    if (expenseForm) {
        expenseForm.addEventListener('submit', submitExpense);
    }

    const budgetForm = document.getElementById('set-budget-form');
    if (budgetForm) {
        budgetForm.addEventListener('submit', submitBudget);
    }
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
    expenseID.value = '';
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

    updateBudget()

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
                    <div>Status: ${notification.is_read ? 'Read' : 'Unread'}</div>
                `;
                notificationList.appendChild(notificationItem);
            });
        } else {
            // If no notifications are found
            alert("No notifications found.");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}