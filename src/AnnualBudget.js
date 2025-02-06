import React, { useState, useEffect } from "react";
import axios from "axios";

function AnnualBudget() {
  const [annualData, setAnnualData] = useState([]);
  const [loading, setLoading] = useState(true);
  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const fetchAnnualData = async () => {
      try {
        // Fetch budgeted expenses
        const budgetResponse = await axios.get("/api/expenses");
        const expensesResponse = await axios.get("/api/individual-expenses", {
          params: { year: currentYear },
        });

        const budgetedExpenses = budgetResponse.data;
        const actualExpenses = expensesResponse.data;

        // Process data by category and subcategory
        const processedData = {};

        // Initialize structure with budgeted amounts
        budgetedExpenses.forEach((budget) => {
          const { category, subcategory, amount } = budget;
          if (!processedData[category]) {
            processedData[category] = {
              name: category,
              annualBudget: 0,
              ytdSpent: 0,
              subcategories: {},
            };
          }

          processedData[category].annualBudget += amount * 12; // Monthly budget * 12 for annual
          if (!processedData[category].subcategories[subcategory]) {
            processedData[category].subcategories[subcategory] = {
              name: subcategory,
              annualBudget: amount * 12,
              ytdSpent: 0,
            };
          }
        });

        // Add actual expenses
        actualExpenses.forEach((expense) => {
          const { category, subcategory, amount } = expense;
          if (processedData[category]) {
            processedData[category].ytdSpent += amount;
            if (processedData[category].subcategories[subcategory]) {
              processedData[category].subcategories[subcategory].ytdSpent +=
                amount;
            }
          }
        });

        // Convert to array format for rendering
        const formattedData = Object.values(processedData).map((category) => ({
          ...category,
          subcategories: Object.values(category.subcategories),
        }));

        setAnnualData(formattedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching annual budget data:", error);
        setLoading(false);
      }
    };

    fetchAnnualData();
  }, [currentYear]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">Loading...</div>
    );
  }

  const calculateTotals = () => {
    return annualData.reduce(
      (totals, category) => ({
        totalBudget: totals.totalBudget + category.annualBudget,
        totalSpent: totals.totalSpent + category.ytdSpent,
      }),
      { totalBudget: 0, totalSpent: 0 }
    );
  };

  const totals = calculateTotals();

  return (
    <div className="max-w-6xl mx-auto py-10 px-4">
      <h2 className="text-2xl font-bold mb-6">
        Annual Budget Summary {currentYear}
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-50">
              <th className="py-3 px-4 border-b text-left">
                Category/Subcategory
              </th>
              <th className="py-3 px-4 border-b text-right">
                Annual Budget ($)
              </th>
              <th className="py-3 px-4 border-b text-right">YTD Spent ($)</th>
              <th className="py-3 px-4 border-b text-right">Remaining ($)</th>
              <th className="py-3 px-4 border-b text-right">% Used</th>
              <th className="py-3 px-4 border-b text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {annualData.map((category, index) => (
              <React.Fragment key={index}>
                {/* Category Row */}
                <tr className="bg-gray-50 font-semibold">
                  <td className="py-2 px-4 border-b">{category.name}</td>
                  <td className="py-2 px-4 border-b text-right">
                    {category.annualBudget.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {category.ytdSpent.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {(category.annualBudget - category.ytdSpent).toFixed(2)}
                  </td>
                  <td className="py-2 px-4 border-b text-right">
                    {((category.ytdSpent / category.annualBudget) * 100).toFixed(
                      1
                    )}
                    %
                  </td>
                  <td className="py-2 px-4 border-b">
                    {category.ytdSpent <= category.annualBudget ? (
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
                      {subcategory.annualBudget.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {subcategory.ytdSpent.toFixed(2)}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {(subcategory.annualBudget - subcategory.ytdSpent).toFixed(
                        2
                      )}
                    </td>
                    <td className="py-2 px-4 border-b text-right">
                      {((subcategory.ytdSpent / subcategory.annualBudget) *
                        100).toFixed(1)}
                      %
                    </td>
                    <td className="py-2 px-4 border-b">
                      {subcategory.ytdSpent <= subcategory.annualBudget ? (
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
            <tr className="font-bold bg-gray-100">
              <td className="py-3 px-4 border-b">TOTAL</td>
              <td className="py-3 px-4 border-b text-right">
                {totals.totalBudget.toFixed(2)}
              </td>
              <td className="py-3 px-4 border-b text-right">
                {totals.totalSpent.toFixed(2)}
              </td>
              <td className="py-3 px-4 border-b text-right">
                {(totals.totalBudget - totals.totalSpent).toFixed(2)}
              </td>
              <td className="py-3 px-4 border-b text-right">
                {((totals.totalSpent / totals.totalBudget) * 100).toFixed(1)}%
              </td>
              <td className="py-3 px-4 border-b">
                {totals.totalSpent <= totals.totalBudget ? (
                  <span className="text-green-600">Under Budget</span>
                ) : (
                  <span className="text-red-600">Over Budget</span>
                )}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AnnualBudget;
