// src/ExpenseEntryForm.js
import React, { useState } from "react";
import axios from "axios";

function ExpenseEntryForm({ categories }) {
  const [expense, setExpense] = useState({
    amount: "",
    vendor: "",
    date: "",
    category: "",
    subcategory: "",
    description: "",
  });

  const handleChange = (e) => {
    setExpense({
      ...expense,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate input fields
    if (
      !expense.amount ||
      !expense.category ||
      !expense.vendor ||
      !expense.subcategory ||
      !expense.date
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    // Send expense data to backend
    axios
      .post("/api/individual-expenses", expense, {
        withCredentials: true,
      })
      .then((response) => {
        console.log("Expense added successfully!");
        // Reset the form
        setExpense({
          amount: "",
          date: "",
          category: "",
          subcategory: "",
          description: "",
        });
      })
      .catch((error) => {
        console.error(error);
        alert("Error adding expense.");
      });
  };

  return (
    <div className="max-w-2xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Add New Expense</h2>
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <p className="text-1xl text-gray-800 mb-5">
          Add each of your expenses below by entering the information, then
          clicking Save Expense.
        </p>
        <p className="text-1xl text-gray-800">
          Categorize them as best as you can , and use the notes feature to add
          any important details for later reference.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount */}
          <div>
            <label className="block text-gray-700">Amount ($)</label>
            <input
              type="number"
              name="amount"
              value={expense.amount}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Vendor */}
          <div>
            <label className="block text-gray-700">Vendor</label>
            <input
              type="text"
              name="vendor"
              value={expense.vendor}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="block text-gray-700">Date</label>
            <input
              type="date"
              name="date"
              value={expense.date}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-gray-700">Category</label>
            <select
              name="category"
              value={expense.category}
              onChange={handleChange}
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
          {expense.category && (
            <div>
              <label className="block text-gray-700">Subcategory</label>
              <select
                name="subcategory"
                value={expense.subcategory}
                onChange={handleChange}
                className="border border-gray-300 rounded-md p-2 w-full"
                required
              >
                <option value="">Select Subcategory</option>
                {categories[expense.category].map((subcategory) => (
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
              value={expense.description}
              onChange={handleChange}
              className="border border-gray-300 rounded-md p-2 w-full"
            />
          </div>

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-green-600"
            >
              Add Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ExpenseEntryForm;
