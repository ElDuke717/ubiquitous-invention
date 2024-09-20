// IndividualAccountsPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function IndividualAccountsPage() {
  const [accounts, setAccounts] = useState([]);
  const [newAccountName, setNewAccountName] = useState("");
  const [newAccountBalance, setNewAccountBalance] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [newTransactions, setNewTransactions] = useState({});
  const [showEditModal, setShowEditModal] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState(null);

  // Fetch all accounts when the component mounts
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Function to fetch all accounts
  const fetchAccounts = () => {
    axios
      .get("/api/accounts")
      .then((response) => {
        setAccounts(response.data);
      })
      .catch((error) => console.error(error));
  };

  // Function to create a new account
  const handleCreateAccount = () => {
    if (!newAccountName || newAccountBalance === "") {
      alert("Please provide account name and starting balance.");
      return;
    }

    axios
      .post("/api/accounts", {
        name: newAccountName,
        starting_balance: parseFloat(newAccountBalance),
      })
      .then((response) => {
        fetchAccounts();
        setNewAccountName("");
        setNewAccountBalance("");
      })
      .catch((error) => console.error(error));
  };

  // Function to handle account card click
  const handleAccountClick = (account) => {
    setSelectedAccount(account);
    fetchTransactions(account.id);
    setShowModal(true);
  };

  // Function to fetch transactions for an account
  const fetchTransactions = (accountId) => {
    axios
      .get(`/api/accounts/${accountId}/transactions`)
      .then((response) => {
        setTransactions(response.data);
      })
      .catch((error) => console.error(error));
  };

  // Function to handle changes in transaction input fields
  const handleTransactionChange = (accountId, e) => {
    const { name, value } = e.target;

    setNewTransactions((prevState) => ({
      ...prevState,
      [accountId]: {
        ...prevState[accountId],
        [name]: value,
      },
    }));
  };

  // Function to add a transaction to an account
  const handleAddTransaction = (accountId) => {
    const transaction = newTransactions[accountId];

    if (!transaction || !transaction.date || transaction.amount === "") {
      alert("Please provide date and amount.");
      return;
    }

    axios
      .post(`/api/accounts/${accountId}/transactions`, {
        ...transaction,
        amount: parseFloat(transaction.amount),
      })
      .then((response) => {
        fetchAccounts();
        fetchTransactions(accountId);
        setNewTransactions((prevState) => ({
          ...prevState,
          [accountId]: {
            date: "",
            vendor: "",
            amount: "",
            description: "",
          },
        }));
      })
      .catch((error) => console.error(error));
  };

  // Function to delete an account
  const handleDeleteAccount = (accountId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this account?"
    );
    if (confirmed) {
      axios
        .delete(`/api/accounts/${accountId}`)
        .then((response) => {
          fetchAccounts();
          setShowModal(false);
        })
        .catch((error) => console.error(error));
    }
  };

  // Function to delete a transaction
  const handleDeleteTransaction = (transactionId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this transaction?"
    );
    if (confirmed) {
      axios
        .delete(`/api/transactions/${transactionId}`)
        .then((response) => {
          fetchAccounts(); // Update account balances
          fetchTransactions(selectedAccount.id); // Refresh transactions list
        })
        .catch((error) => console.error(error));
    }
  };

  // Function to handle Edit button click
  const handleEditTransactionClick = (transaction) => {
    setTransactionToEdit({ ...transaction }); // Create a copy
    setShowEditModal(true);
  };

  // Function to handle changes in the edit modal inputs
  const handleEditModalChange = (e) => {
    const { name, value } = e.target;
    setTransactionToEdit((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Function to update the transaction
  const handleUpdateTransaction = () => {
    axios
      .put(`/api/transactions/${transactionToEdit.id}`, {
        ...transactionToEdit,
        amount: parseFloat(transactionToEdit.amount),
      })
      .then((response) => {
        fetchAccounts(); // Update account balances
        fetchTransactions(selectedAccount.id); // Refresh transactions list
        setShowEditModal(false);
        setTransactionToEdit(null);
      })
      .catch((error) => console.error(error));
  };

  // Function to format dates to MM-DD-YYYY
  const formatDateToMMDDYYYY = (dateStr) => {
    const date = new Date(dateStr);
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are zero-based
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  };

  // Function to handle closing the modal
  const handleCloseModal = () => {
    setShowModal(false);
    setTransactions([]);
  };

  return (
    <div className="max-w-6xl mx-auto py-10">
      <h2 className="text-2xl font-bold mb-5">Individual Accounts</h2>
      <h3 className="text-1xl mb-5">
        Add new accounts here. You can add a starting balance, or leave it blank
        to start with a balance of zero. In the form below, add each
        transaction, positive numbers to add to the balance and negative to
        subract.
      </h3>
      {/* Create New Account */}
      <div className="mb-6">
        <h3 className="text-xl font-bold mb-3">Create New Account</h3>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
          <input
            type="text"
            placeholder="Account Name"
            value={newAccountName}
            onChange={(e) => setNewAccountName(e.target.value)}
            className="border border-gray-300 rounded-md p-2 flex-grow"
          />
          <input
            type="number"
            placeholder="Starting Balance"
            value={newAccountBalance}
            onChange={(e) => setNewAccountBalance(e.target.value)}
            className="border border-gray-300 rounded-md p-2 flex-grow"
          />
          <button
            onClick={handleCreateAccount}
            className="bg-green-500 text-white px-4 py-2 rounded"
          >
            Create Account
          </button>
        </div>
      </div>

      {/* Accounts List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => (
          <div key={account.id} className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="text-xl font-bold">{account.name}</h3>
            <p className="mt-2">
              Current Balance:{" "}
              <span className="font-semibold">
                ${account.current_balance.toFixed(2)}
              </span>
            </p>

            {/* Add Transaction Form */}
            <div className="mt-4">
              <h4 className="font-bold mb-2">Add Transaction</h4>
              <div className="space-y-2">
                <input
                  type="date"
                  name="date"
                  value={newTransactions[account.id]?.date || ""}
                  onChange={(e) => handleTransactionChange(account.id, e)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  name="vendor"
                  placeholder="Vendor"
                  value={newTransactions[account.id]?.vendor || ""}
                  onChange={(e) => handleTransactionChange(account.id, e)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount ($)"
                  value={newTransactions[account.id]?.amount || ""}
                  onChange={(e) => handleTransactionChange(account.id, e)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={newTransactions[account.id]?.description || ""}
                  onChange={(e) => handleTransactionChange(account.id, e)}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
                <button
                  onClick={() => handleAddTransaction(account.id)}
                  className="bg-blue-500 text-white px-4 py-2 rounded w-full"
                >
                  Add Transaction
                </button>
              </div>
            </div>

            {/* View Transactions Button */}
            <div
              className="mt-4 text-center text-white bg-green-500 cursor-pointer px-4 py-2 rounded w-full"
              onClick={() => handleAccountClick(account)}
            >
              View Transactions
            </div>
          </div>
        ))}
      </div>

      {/* Modal for Account Transactions */}
      {showModal && selectedAccount && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center overflow-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-2xl w-full">
            <h3 className="text-xl font-bold mb-4">
              Transactions for {selectedAccount.name}
            </h3>
            {/* Transactions Table */}
            <table className="min-w-full bg-white shadow-md rounded">
              <thead>
                <tr>
                  <th className="py-2 px-4 border-b">Date</th>
                  <th className="py-2 px-4 border-b">Vendor</th>
                  <th className="py-2 px-4 border-b">Amount ($)</th>
                  <th className="py-2 px-4 border-b">Description</th>
                  <th className="py-2 px-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td className="py-2 px-4 border-b">
                      {formatDateToMMDDYYYY(transaction.date)}
                    </td>
                    <td className="py-2 px-4 border-b">{transaction.vendor}</td>
                    <td className="py-2 px-4 border-b">
                      {transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {transaction.description}
                    </td>
                    <td className="py-2 px-4 border-b">
                      <div className="flex space-x-2">
                        <button
                          onClick={() =>
                            handleEditTransactionClick(transaction)
                          }
                          className="bg-blue-500 text-white px-2 py-1 rounded"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            handleDeleteTransaction(transaction.id)
                          }
                          className="bg-red-500 text-white px-2 py-1 rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Delete Account Button */}
            <button
              onClick={() => handleDeleteAccount(selectedAccount.id)}
              className="bg-red-500 text-white px-4 py-2 rounded mt-4"
            >
              Delete Account
            </button>
            <button
              onClick={handleCloseModal}
              className="bg-gray-500 text-white px-4 py-2 rounded mt-4 ml-2"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Edit Transaction Modal */}
      {showEditModal && transactionToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit Transaction</h3>
            <div className="space-y-4">
              {/* Date */}
              <div>
                <label className="block text-gray-700">Date</label>
                <input
                  type="date"
                  name="date"
                  value={transactionToEdit.date}
                  onChange={handleEditModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Vendor */}
              <div>
                <label className="block text-gray-700">Vendor</label>
                <input
                  type="text"
                  name="vendor"
                  value={transactionToEdit.vendor || ""}
                  onChange={handleEditModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Amount */}
              <div>
                <label className="block text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  name="amount"
                  value={transactionToEdit.amount}
                  onChange={handleEditModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Description */}
              <div>
                <label className="block text-gray-700">Description</label>
                <input
                  type="text"
                  name="description"
                  value={transactionToEdit.description || ""}
                  onChange={handleEditModalChange}
                  className="border border-gray-300 rounded-md p-2 w-full"
                />
              </div>
              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={handleUpdateTransaction}
                  className="bg-green-500 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setTransactionToEdit(null);
                  }}
                  className="bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default IndividualAccountsPage;
