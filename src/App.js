// App.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { Route, Routes, Link, Navigate, useNavigate } from "react-router-dom";
import ExpenseEntryForm from "./ExpenseEntryForm";
import MonthlyExpensesGraph from "./MonthlyExpensesGraph";
import AnnualExpensesGraph from "./AnnualExpensesGraph";
import MonthlyExpensesPage from "./MonthlyExpensesPage";
import JournalPage from "./JournalPage";
import CreditCardManagement from "./CreditCardManagement";
import SeventyTwoTCalculator from "./SeventyTwoTCalculator";
import MonthlyBudgetSummary from "./MonthlyBudgetSummary";
import AllExpensesPage from "./AllExpensesPage";
import IndividualAccountsPage from "./IndividualAccountsPage";
import SubscriptionsManagement from "./SubscriptionsManagement";
import AnnualBudget from "./AnnualBudget";
import AutomaticPayments from "./AutomaticPayments";
import Login from "./Login";
import "./index.css";

// Configure axios defaults for the backend API
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  withCredentials: true
});

function App() {
  const [expenses, setExpenses] = useState({});
  const [actualExpenses, setActualExpenses] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const categories = {
    Housing: ["Mortgage Principle + Interest", "Escrow", "HOA", "Home Maintenance"],
    Utilities: [
      "Gas",
      "Electricity",
      "Internet",
      "Mobile Phones",
      "Water/Sewer",
      "Trash/Recycling",
    ],
    Tech: [
      "YouTube Premium",
      "ChatGPT",
      "Bitwarden",
      "Amazon Prime",
      "Amazon Storage",
      "Google Storage",
      "Apple Storage",
      "Apple Apps",
      "Notability",
      "Microsoft 365",
      "Canva",
      "Netlify",
      "Dakboard",
      "Spotify",
    ],
    HealthCare: [
      "Health Care Premiums",
      "Vision/Dental Premiums",
      "Medical Bills",
      "YMCA Membership",
    ],
    Transportation: [
      "Car Insurance",
      "Tolls and Parking",
      "Registration and DMV Fees",
      "Car Tax",
      "Fuel",
      "Car Maintenance",
    ],
    'Food And Essentials': [
      "Groceries",
      "Supplements",
      "Costco Membership",
      "Thrive Membership",
      "Cleaning Supplies & Toiletries"
    ],
    Miscellaneous: [
      "Gifts",
      "Tuition",
      "Tech Supplies",
      "Mom",
      "Salon/Barber",
      "Umbrella Insurance (Annual)",
      "Dogs",
      "Reza",
      "Arya",
      "Business expense",
      "Other, see notes",
    ],
    'Non-Essentials': [
      "Eating Out",
      "Vacation/Travel",
      "Nick",
      "Samira",
      "Furniture and Electronics",
      "Small Home Items",
    ],
    Taxes: ["2024 Taxes not paid", "Federal", "State", "Social Security", "Medicare", "Tax Preparation"],
  };

  const calculateTotals = () => {
    let monthlyTotal = 0;
    let annualTotal = 0;

    Object.values(expenses).forEach((subcategories) => {
      Object.values(subcategories).forEach((amount) => {
        monthlyTotal += amount;
      });
    });

    annualTotal = monthlyTotal * 12;

    return { monthlyTotal, annualTotal };
  };

  const { monthlyTotal, annualTotal } = calculateTotals();

  // Check authentication status on mount
  useEffect(() => {
    api
      .get("api/check-auth")
      .then((response) => {
        setIsAuthenticated(response.data.isAuthenticated);
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  // Fetch expenses when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      api
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
          setExpenses(expensesByCategory);
        })
        .catch((error) => console.error(error));

      // Fetch actual expenses
      api
        .get("/api/individual-expenses")
        .then((response) => {
          const fetchedActualExpenses = response.data;
          const actualExpensesByCategory = {};

          fetchedActualExpenses.forEach((expense) => {
            const { category, subcategory, amount } = expense;
            if (!actualExpensesByCategory[category]) {
              actualExpensesByCategory[category] = {};
            }
            if (!actualExpensesByCategory[category][subcategory]) {
              actualExpensesByCategory[category][subcategory] = 0;
            }
            actualExpensesByCategory[category][subcategory] += amount;
          });

          setActualExpenses(actualExpensesByCategory);
        })
        .catch((error) => console.error(error));
    }
  }, [isAuthenticated]);

  const handleChange = (category, subcategory, value) => {
    setExpenses((prevExpenses) => ({
      ...prevExpenses,
      [category]: {
        ...prevExpenses[category],
        [subcategory]: parseFloat(value) || 0,
      },
    }));
  };

  const handleSubmit = () => {
    // Prepare expenses data in the expected format
    const expensesArray = [];

    Object.keys(expenses).forEach((category) => {
      Object.keys(expenses[category]).forEach((subcategory) => {
        expensesArray.push({
          category,
          subcategory,
          amount: expenses[category][subcategory],
        });
      });
    });

    api
      .post("/api/expenses", expensesArray)
      .then((response) => console.log(response.data))
      .catch((error) => console.error(error));
  };

  const handleLogout = () => {
    api
      .post("/api/logout", {})
      .then(() => {
        setIsAuthenticated(false);
        navigate("/login");
      })
      .catch((error) => console.error(error));
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Conditionally render the nav bar */}
      {isAuthenticated && (
        <nav className="bg-white shadow">
          <div className="container mx-auto px-4">
            <div className="relative flex justify-between items-center h-16">
              <div className="flex items-center">
                <img
                  src="/8-bit_green1.png"
                  alt="Logo"
                  className="h-8 w-8 rounded-full"
                />
                <Link
                  to="/"
                  className="text-gray-800 text-xl font-bold ml-2"
                >
                  Your Budget Home
                </Link>
              </div>

              {/* Mobile menu button */}
              <div className="flex lg:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="text-gray-600 hover:text-gray-900 focus:outline-none"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>

              {/* Desktop navigation */}
              <div className="hidden lg:flex lg:items-center lg:space-x-4">
                <Link to="/add-expense" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Add Expense
                </Link>
                <Link to="/all-expenses" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  All Expenses
                </Link>
                <Link to="/monthly-expenses" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Current Monthly Expenses
                </Link>
                <Link to="/monthly-budget" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Monthly Budgets
                </Link>
                <Link to="/individual-accounts" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Individual Accounts
                </Link>
                <Link to="/journal" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Journal
                </Link>
                <Link to="/credit-card-management" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Credit Cards
                </Link>
                <Link to="/subscriptions" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Subscriptions
                </Link>
                <Link to="/72t-calculator" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  72T Calculator
                </Link>
                <Link to="/annual-budget" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Annual Budget
                </Link>
                <Link to="/automatic-payments" className="text-gray-600 hover:text-gray-900 px-3 py-2">
                  Automatic Payments
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Logout
                </button>
              </div>
            </div>

            {/* Mobile menu */}
            <div className={`lg:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
              <div className="px-2 pt-2 pb-3 space-y-1">
                <Link to="/add-expense" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Add Expense
                </Link>
                <Link to="/all-expenses" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  All Expenses
                </Link>
                <Link to="/monthly-expenses" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Current Monthly Expenses
                </Link>
                <Link to="/monthly-budget" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Monthly Budgets
                </Link>
                <Link to="/individual-accounts" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Individual Accounts
                </Link>
                <Link to="/journal" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Journal
                </Link>
                <Link to="/credit-card-management" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Credit Cards
                </Link>
                <Link to="/subscriptions" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Subscriptions
                </Link>
                <Link to="/72t-calculator" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  72T Calculator
                </Link>
                <Link to="/annual-budget" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Annual Budget
                </Link>
                <Link to="/automatic-payments" className="block text-gray-600 hover:text-gray-900 px-3 py-2">
                  Automatic Payments
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-gray-600 hover:text-gray-900 px-3 py-2"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <div className="max-w-4xl mx-auto py-10">
        <Routes>
          {!isAuthenticated ? (
            <>
              <Route
                path="/login"
                element={<Login setIsAuthenticated={setIsAuthenticated} />}
              />
              {/* Redirect all other routes to /login */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </>
          ) : (
            <>
              {/* Redirect /login to home if accessed while authenticated */}
              <Route path="/login" element={<Navigate to="/" replace />} />
              <Route
                path="/"
                element={
                  <div className="min-h-screen bg-gray-100">
                    <div className="max-w-4xl mx-auto py-10">
                      <h1 className="text-3xl font-bold text-center text-gray-800 mb-10">
                        Set Your Home Budget
                      </h1>
                      <div className="bg-white p-6 rounded-lg shadow-md mb-10">
                        <p className="text-1xl text-gray-800 mb-5">
                          Add each of your monthly expense targets below.
                        </p>
                        <p className="text-1xl text-gray-800">
                          After entering each target amount, click the Save
                          Expenses button to save them. Graphs of your monthly
                          and annual expenses are at the bottom of the page.
                        </p>
                      </div>
                      <div className="space-y-8">
                        {Object.keys(categories).map((category) => (
                          <div
                            key={category}
                            className="bg-white p-6 rounded-lg shadow-md"
                          >
                            <h2 className="text-xl font-semibold text-gray-700 mb-4">
                              {category}
                            </h2>
                            <div className="grid grid-cols-2 gap-6">
                              {categories[category].map((subcategory) => (
                                <div
                                  key={subcategory}
                                  className="flex flex-col space-y-2"
                                >
                                  <div className="flex items-center space-x-4">
                                    <label className="text-gray-600 w-40">
                                      {subcategory}
                                    </label>
                                    <input
                                      type="number"
                                      className="border border-gray-300 rounded-md p-2 w-full"
                                      value={
                                        expenses[category]?.[subcategory] || ""
                                      }
                                      onChange={(e) =>
                                        handleChange(
                                          category,
                                          subcategory,
                                          e.target.value
                                        )
                                      }
                                    />
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    Actual: $
                                    {actualExpenses[category]?.[subcategory]
                                      ? actualExpenses[category][
                                          subcategory
                                        ].toFixed(2)
                                      : "0.00"}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-10 flex justify-center">
                        <button
                          onClick={handleSubmit}
                          className="bg-blue-500 text-white font-bold py-2 px-6 rounded-lg shadow hover:bg-blue-600"
                        >
                          Save Expenses
                        </button>
                      </div>
                      <div className="mt-10">
                        <h3>
                          Monthly Expenses: {`$${monthlyTotal.toFixed(2)}`}
                        </h3>
                        <MonthlyExpensesGraph
                          expenses={expenses}
                          actualExpenses={actualExpenses}
                        />
                        <h3>Annual Expenses: {`$${annualTotal.toFixed(2)}`}</h3>
                        <AnnualExpensesGraph
                          expenses={expenses}
                          actualExpenses={actualExpenses}
                        />
                      </div>
                    </div>
                  </div>
                }
              />
              <Route
                path="/add-expense"
                element={<ExpenseEntryForm categories={categories} />}
              />
              <Route
                path="/monthly-expenses"
                element={<MonthlyExpensesPage categories={categories} />}
              />
              <Route
                path="/all-expenses"
                element={<AllExpensesPage categories={categories} />}
              />
              <Route
                path="/monthly-budget"
                element={<MonthlyBudgetSummary categories={categories} />}
              />
              <Route path="/journal" element={<JournalPage />} />
              <Route
                path="/credit-card-management"
                element={<CreditCardManagement />}
              />
              <Route
                path="/72t-calculator"
                element={<SeventyTwoTCalculator />}
              />
              <Route
                path="/individual-accounts"
                element={<IndividualAccountsPage />}
              />
              <Route
                path="/subscriptions"
                element={<SubscriptionsManagement />}
              />
              <Route
                path="/annual-budget"
                element={<AnnualBudget />}
              />
              <Route
                path="/automatic-payments"
                element={<AutomaticPayments />}
              />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

export default App;
