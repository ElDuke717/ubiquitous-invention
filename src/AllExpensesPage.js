// AllExpensesPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function AllExpensesPage({ categories }) {
  const [expenses, setExpenses] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const expensesPerPage = 50;
  const [totalPages, setTotalPages] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch expenses with pagination
  useEffect(() => {
    fetchExpenses();
  }, [currentPage, searchTerm]);

  const fetchExpenses = () => {
    axios
      .get("/api/individual-expenses-paginated", {
        params: {
          page: currentPage,
          limit: expensesPerPage,
          search: searchTerm,
        },
      })
      .then((response) => {
        setExpenses(response.data.expenses);
        setTotalPages(response.data.totalPages);
      })
      .catch((error) => console.error(error));
  };

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
        const updatedExpenses = expenses.map((expense) =>
          expense.id === selectedExpense.id ? selectedExpense : expense
        );
        setExpenses(updatedExpenses);
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
          const updatedExpenses = expenses.filter(
            (expense) => expense.id !== id
          );
          setExpenses(updatedExpenses);
        })
        .catch((error) => console.error(error));
    }
  };

  // Helper function to convert a date from YYYY-MM-DD to MM-DD-YYYY based on local time
const formatDateToMMDDYYYY = (dateStr) => {
  const dateParts = dateStr.split("-"); // Split the date string into [YYYY, MM, DD]
  
  // Create a date object using the local time by specifying individual date components
  const date = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);

  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${month}-${day}-${year}`;
};

  // Pagination Controls
  const renderPagination = () => (
    <div className="flex justify-center mt-4">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-4 py-2 bg-gray-300 rounded-l"
      >
        Previous
      </button>
      <span className="px-4 py-2 bg-gray-200">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, totalPages))
        }
        disabled={currentPage === totalPages}
        className="px-4 py-2 bg-gray-300 rounded-r"
      >
        Next
      </button>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">All Expenses</h2>
      {/* Search Input */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search expenses..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on new search
          }}
          className="border border-gray-300 rounded-md p-2 w-full"
        />
      </div>
      
      {/* Expenses Table */}
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
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="py-2 px-4 border-b">
                {formatDateToMMDDYYYY(expense.date)}
              </td>
              <td className="py-2 px-4 border-b">{expense.vendor}</td>
              <td className="py-2 px-4 border-b">{expense.category}</td>
              <td className="py-2 px-4 border-b">{expense.subcategory}</td>
              <td className="py-2 px-4 border-b">
                {parseFloat(expense.amount).toFixed(2)}
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
      {renderPagination()}
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
                  value={selectedExpense.description || ''}
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

export default AllExpensesPage;