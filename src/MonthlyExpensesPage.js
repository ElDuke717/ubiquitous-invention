// MonthlyExpensesPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function MonthlyExpensesPage({ categories }) {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [budgetedExpenses, setBudgetedExpenses] = useState({});
  const [expenseSummary, setExpenseSummary] = useState([]);
  const [showModal, setShowModal] = useState(false); // Manage modal visibility
  const [selectedExpense, setSelectedExpense] = useState(null); // Manage selected expense for editing

  // Fetch data (as per your existing code)
  useEffect(() => {
    const currentDate = new Date();
    const currentMonth = (currentDate.getMonth() + 1).toString(); // Months are 0-based in JS
    const currentYear = currentDate.getFullYear().toString();
  
    // Fetch individual expenses for the current month
    axios
      .get("/api/individual-expenses", {
        params: { month: currentMonth, year: currentYear },
      })
      .then((response) => {
        // Sort the expenses by date in descending order
        const sortedExpenses = response.data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setMonthlyExpenses(sortedExpenses);
      })
      .catch((error) => console.error(error));
  
    // Fetch budgeted expenses
    axios
      .get("/api/expenses")
      .then((response) => {
        const fetchedExpenses = response.data;
        const expensesByCategory = {};
  
        fetchedExpenses.forEach((expense) => {
          const { category, subcategory, amount } = expense;
          if (!expensesByCategory[category]) {
            expensesByCategory[category] = {};
          }
          expensesByCategory[category][subcategory] = amount;
        });
  
        setBudgetedExpenses(expensesByCategory);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    // Calculate expense summary once data is fetched
    const summary = {};

    // Aggregate actual expenses by category
    monthlyExpenses.forEach((expense) => {
      const { category, amount } = expense;
      if (!summary[category]) {
        summary[category] = { budgeted: 0, actual: 0 };
      }
      summary[category].actual += amount;
    });

    // Add budgeted amounts
    Object.keys(budgetedExpenses).forEach((category) => {
      if (!summary[category]) {
        summary[category] = { budgeted: 0, actual: 0 };
      }
      const categoryBudget = Object.values(budgetedExpenses[category]).reduce(
        (sum, amount) => sum + amount,
        0
      );
      summary[category].budgeted = categoryBudget;
    });

    // Convert summary object to array for rendering
    const summaryArray = Object.keys(summary).map((category) => ({
      category,
      budgeted: summary[category].budgeted,
      actual: summary[category].actual,
      difference: summary[category].budgeted - summary[category].actual,
    }));

    setExpenseSummary(summaryArray);
  }, [monthlyExpenses, budgetedExpenses]);

  // Function to open the modal and select the expense
  const handleEditClick = (expense) => {
    setSelectedExpense({
      ...expense,
      vendor: expense.vendor || "",
    });
    setShowModal(true);
  };

  // Function to handle changes in the input fields within the modal
  const handleModalChange = (e) => {
    const { name, value } = e.target;
    setSelectedExpense({
      ...selectedExpense,
      [name]: value,
    });
  };

  // Function to submit the updated expense to the backend
  const handleUpdateExpense = () => {
    axios
      .put(
        `/api/individual-expenses/${selectedExpense.id}`,
        selectedExpense
      )
      .then((response) => {
        // Refresh the expenses after successful update
        const updatedExpenses = monthlyExpenses.map((expense) =>
          expense.id === selectedExpense.id ? selectedExpense : expense
        );
        setMonthlyExpenses(updatedExpenses);
        setShowModal(false);
      })
      .catch((error) => console.error(error));
  };

  // Function to delete the expense
  const handleDeleteExpense = (id) => {
    const confirmed = window.confirm("Are you sure you want to delete this expense?");
    
    if (confirmed) {
      axios
        .delete(`/api/individual-expenses/${id}`)
        .then((response) => {
          // Refresh the expenses after successful delete
          const updatedExpenses = monthlyExpenses.filter(
            (expense) => expense.id !== id
          );
          setMonthlyExpenses(updatedExpenses);
        })
        .catch((error) => console.error(error));
    }
  };

  // Helper function to convert a date from YYYY-MM-DD to DD-MM-YYYY
  const formatDateToMMDDYYYY = (dateStr) => {
    const [year, month, day] = dateStr.split("-");
    return `${month}-${day}-${year}`;
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Monthly Expenses Summary</h2>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Budgeted Amount ($)</th>
            <th className="py-2 px-4 border-b">Actual Spent ($)</th>
            <th className="py-2 px-4 border-b">Difference ($)</th>
            <th className="py-2 px-4 border-b">Status</th>
          </tr>
        </thead>
        <tbody>
          {expenseSummary.map((item) => (
            <tr key={item.category}>
              <td className="py-2 px-4 border-b">{item.category}</td>
              <td className="py-2 px-4 border-b">{item.budgeted.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">{item.actual.toFixed(2)}</td>
              <td className="py-2 px-4 border-b">
                {item.difference.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b">
                {item.difference >= 0 ? (
                  <span className="text-green-600">Under Budget</span>
                ) : (
                  <span className="text-red-600">Over Budget</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Detailed Expenses List */}
      <h3 className="text-xl font-bold mt-10 mb-5">Detailed Expenses</h3>
      <table className="min-w-full bg-white shadow-md rounded">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b">Date</th>
            <th className="py-2 px-4 border-b">Vendor</th>
            <th className="py-2 px-4 border-b">Category</th>
            <th className="py-2 px-4 border-b">Subcategory</th>
            <th className="py-2 px-4 border-b">Amount ($)</th>
            <th className="py-2 px-4 border-b">Description</th>
            <th className="py-2 px-4 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {monthlyExpenses.map((expense) => (
            <tr key={expense.id}>
              <td className="py-2 px-4 border-b">
                {formatDateToMMDDYYYY(expense.date)}
              </td>
              <td className="py-2 px-4 border-b">{expense.vendor}</td>
              <td className="py-2 px-4 border-b">{expense.category}</td>
              <td className="py-2 px-4 border-b">{expense.subcategory}</td>
              <td className="py-2 px-4 border-b">
                {expense.amount.toFixed(2)}
              </td>
              <td className="py-2 px-4 border-b">{expense.description}</td>
              <td className="py-2 px-4 border-b">
            <div className="flex flex-col space-y-2">
                <button
                onClick={() => handleEditClick(expense)}
                className="bg-blue-500 text-white w-full py-2 rounded"
                >
                Edit
                </button>
                <button
                onClick={() => handleDeleteExpense(expense.id)}
                className="bg-red-500 text-white w-full py-2 rounded"
                >
                Delete
                </button>
            </div>
            </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal for Editing Expense */}
      {showModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-xl font-bold mb-4">Edit Expense</h3>
            <div className="space-y-4">
              {/* Amount */}
              <div>
                <label className="block font-bold text-gray-700">
                  Amount ($)
                </label>
                <input
                  type="number"
                  name="amount"
                  value={selectedExpense.amount}
                  onChange={handleModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Vendor */}
              <div>
                <label className="block font-bold text-gray-700">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={selectedExpense.vendor}
                  onChange={handleModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Date */}
              <div>
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={selectedExpense.date}
                  onChange={handleModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                />
              </div>
              {/* Category */}
              <div>
                <label className="block text-gray-700">Category</label>
                <select
                  name="category"
                  value={selectedExpense.category}
                  onChange={handleModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                  required
                >
                  <option value="">Select Category</option>
                  {Object.keys(categories).map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subcategory */}
              {selectedExpense.category && (
                <div>
                  <label className="block text-gray-700">Subcategory</label>
                  <select
                    name="subcategory"
                    value={selectedExpense.subcategory}
                    onChange={handleModalChange}
                    className="border border-gray-300 rounded-md p-2 w-full"
                    required
                  >
                    <option value="">Select Subcategory</option>
                    {categories[selectedExpense.category].map((subcategory) => (
                      <option key={subcategory} value={subcategory}>
                        {subcategory}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Description */}
              <div>
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={selectedExpense.description}
                  onChange={handleModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>

              <button
                onClick={handleUpdateExpense}
                className="bg-green-500 text-white px-4 py-2 rounded mt-4"
              >
                Save Changes
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-2"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MonthlyExpensesPage;
