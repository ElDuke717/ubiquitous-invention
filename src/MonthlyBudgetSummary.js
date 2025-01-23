import React, { useState, useEffect } from "react";
import axios from "axios";

function MonthlyBudgetSummary() {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [budgetSummary, setBudgetSummary] = useState([]);
  const [budgetedExpenses, setBudgetedExpenses] = useState({});

  // Fetch budgeted expenses once
  useEffect(() => {
    axios
      .get("/api/expenses")
      .then((response) => {
        const fetchedExpenses = response.data;
        const expensesByCategory = {};

        fetchedExpenses.forEach((expense) => {
          const { category, subcategory, amount } = expense;
          if (!expensesByCategory[category]) {
            expensesByCategory[category] = {
              total: { budgeted: 0, actual: 0 },
              subcategories: {},
            };
          }
          expensesByCategory[category].subcategories[subcategory] = {
            budgeted: amount,
            actual: 0,
          };
          expensesByCategory[category].total.budgeted += amount;
        });

        setBudgetedExpenses(expensesByCategory);
      })
      .catch((error) => console.error(error));
  }, []);

  useEffect(() => {
    const month = (selectedMonth.getMonth() + 1).toString();
    const year = selectedMonth.getFullYear().toString();

    axios
      .get("/api/individual-expenses", {
        params: { month: month, year: year },
      })
      .then((response) => {
        const monthlyExpenses = response.data;
        const summary = { ...budgetedExpenses };

        // Reset actual amounts
        Object.keys(summary).forEach((category) => {
          summary[category].total.actual = 0;
          Object.keys(summary[category].subcategories).forEach((subcategory) => {
            summary[category].subcategories[subcategory].actual = 0;
          });
        });

        // Add actual expenses
        monthlyExpenses.forEach((expense) => {
          const { category, subcategory, amount } = expense;
          if (summary[category]) {
            summary[category].total.actual += amount;
            if (summary[category].subcategories[subcategory]) {
              summary[category].subcategories[subcategory].actual += amount;
            }
          }
        });

        // Convert to array format for rendering
        const summaryArray = Object.entries(summary).map(([category, data]) => ({
          category,
          budgeted: data.total.budgeted,
          actual: data.total.actual,
          difference: data.total.budgeted - data.total.actual,
          subcategories: Object.entries(data.subcategories).map(([name, amounts]) => ({
            name,
            budgeted: amounts.budgeted,
            actual: amounts.actual,
            difference: amounts.budgeted - amounts.actual,
          })),
        }));

        setBudgetSummary(summaryArray);
      })
      .catch((error) => console.error(error));
  }, [selectedMonth, budgetedExpenses]);

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

  const calculateTotals = () => {
    return budgetSummary.reduce(
      (totals, item) => ({
        totalBudgeted: totals.totalBudgeted + item.budgeted,
        totalActual: totals.totalActual + item.actual,
        totalDifference: totals.totalDifference + item.difference,
      }),
      { totalBudgeted: 0, totalActual: 0, totalDifference: 0 }
    );
  };

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-5">
        <button
          onClick={handlePreviousMonth}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Previous
        </button>
        <h2 className="text-2xl font-bold">
          Monthly Budget Summary for {formatMonthYear(selectedMonth)}
        </h2>
        <button
          onClick={handleNextMonth}
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
        >
          Next
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left">Category/Subcategory</th>
              <th className="py-3 px-4 border-b text-right">Budgeted Amount ($)</th>
              <th className="py-3 px-4 border-b text-right">Actual Spent ($)</th>
              <th className="py-3 px-4 border-b text-right">Difference ($)</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetSummary.map((category, index) => (
              <React.Fragment key={index}>
                {/* Category Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-4 border-b">{category.category}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {category.budgeted.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {category.actual.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {category.difference.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b">
                    {category.difference >= 0 ? (
                      <span className="text-green-600">Under Budget</span>
                    ) : (
                      <span className="text-red-600">Over Budget</span>
                    )}
                  </td>
                </tr>
                {/* Subcategory Rows */}
                {category.subcategories.map((subcategory, subIndex) => (
                  <tr key={`${index}-${subIndex}`} className="hover:bg-gray-50">
                    <td className="py-2 px-4 border-b pl-8">
                      {subcategory.name}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {subcategory.budgeted.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {subcategory.actual.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {subcategory.difference.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b">
                      {subcategory.difference >= 0 ? (
                        <span className="text-green-600">Under Budget</span>
                      ) : (
                        <span className="text-red-600">Over Budget</span>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
            {/* Total Row */}
            {budgetSummary.length > 0 && (
              <tr className="font-bold bg-gray-100">
                <td className="py-3 px-4 border-b">TOTAL</td>
                <td className="py-3 px-4 border-b text-right">
                  {calculateTotals().totalBudgeted.toFixed(2)}
                </td>
                <td className="py-3 px-4 border-b text-right">
                  {calculateTotals().totalActual.toFixed(2)}
                </td>
                <td className="py-3 px-4 border-b text-right">
                  {calculateTotals().totalDifference.toFixed(2)}
                </td>
                <td className="py-3 px-4 border-b">
                  {calculateTotals().totalDifference >= 0 ? (
                    <span className="text-green-600">Under Budget</span>
                  ) : (
                    <span className="text-red-600">Over Budget</span>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MonthlyBudgetSummary;
