// BudgetSummaryPage.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function BudgetSummaryPage() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [budgetedExpenses, setBudgetedExpenses] = useState({});

  // Fetch budgeted expenses once
  useEffect(() => {
    axios
      .get("http://localhost:5001/expenses")
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
    const month = (selectedMonth.getMonth() + 1).toString();
    const year = selectedMonth.getFullYear().toString();

    axios
      .get("http://localhost:5001/individual-expenses", {
        params: { month: month, year: year },
      })
      .then((response) => {
        const monthlyExpenses = response.data;

        // Calculate summary similar to MonthlyExpensesPage
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

        setBudgetSummary(summaryArray);
      })
      .catch((error) => console.error(error));
  }, [selectedMonth, budgetedExpenses]);

  // Functions to change the month
  const handlePreviousMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setSelectedMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const formatMonthYear = (date) => {
    const options = { month: "long", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={handlePreviousMonth}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Previous
        </button>
        <h2 className="text-2xl font-bold">
          Budget Summary for {formatMonthYear(selectedMonth)}
        </h2>
        <button
          onClick={handleNextMonth}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Next
        </button>
      </div>

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
          {budgetSummary.map((item) => (
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
    </div>
  );
}

export default BudgetSummaryPage;