import React, { useState, useEffect } from "react";
import GraphComponent from "./GraphComponent";

function SeventyTwoTCalculator() {
  const [interestRate, setInterestRate] = useState(5); // default 5%
  const [lifeExpectancy, setLifeExpectancy] = useState(30); // default to 30 years
  const [annualDistribution, setAnnualDistribution] = useState(32000); // default
  const [currentIRABalance, setCurrentIRABalance] = useState(1000000); // example balance
  const [amountNeeded, setAmountNeeded] = useState(0);
  const [remainingIRA, setRemainingIRA] = useState(0);
  const [growthData, setGrowthData] = useState([]);
  const [returnRate, setReturnRate] = useState(8); // default 8%
  const [inflationRate, setInflationRate] = useState(4); // default 4%

  // Life expectancy options for dropdown (10 to 60 years)
  const lifeExpectancyOptions = Array.from({ length: 51 }, (_, i) => i + 10);

  // PV Calculation: Calculates the amount needed for the desired annual distribution
  const calculatePV = (rate, nper, pmt) => {
    return (pmt * (1 - Math.pow(1 + rate / 100, -nper))) / (rate / 100);
  };

  // Handle input changes and recalculate
  useEffect(() => {
    const neededAmount = calculatePV(
      interestRate,
      lifeExpectancy,
      annualDistribution
    );
    setAmountNeeded(neededAmount);

    const remainingAmount = currentIRABalance - neededAmount;
    setRemainingIRA(remainingAmount);

    // Calculate growth of remaining amount
    const growth = calculateGrowth(
      remainingAmount,
      returnRate,
      inflationRate,
      lifeExpectancy
    );
    setGrowthData(growth);
  }, [
    interestRate,
    lifeExpectancy,
    annualDistribution,
    currentIRABalance,
    returnRate,
    inflationRate,
  ]);

  // Growth Calculation over the years
  const calculateGrowth = (
    remainingAmount,
    returnRate,
    inflationRate,
    years
  ) => {
    let growthData = [];
    let currentBalance = remainingAmount;

    for (let year = 0; year <= years; year++) {
      if (year % 5 === 0) {
        growthData.push({
          year: year,
          balance: currentBalance.toFixed(2),
        });
      }
      // Apply return rate and inflation
      currentBalance *= 1 + returnRate / 100; // apply return
      currentBalance /= 1 + inflationRate / 100; // adjust for inflation
    }
    return growthData;
  };

  // Render Table showing growth every 5 years
  const renderTable = () => (
    <table className="min-w-full bg-white">
      <thead>
        <tr>
          <th className="px-6 py-3">Year</th>
          <th className="px-6 py-3">Balance</th>
        </tr>
      </thead>
      <tbody>
        {growthData.map((entry) => (
          <tr key={entry.year}>
            <td className="border px-6 py-3">{entry.year}</td>
            <td className="border px-6 py-3">{entry.balance}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div>
      <h1 className="text-3xl	block font-bold text-gray-900">
        72(t) IRA Calculator
      </h1>
      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-6 my-6">
        {/* Interest Rate */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Interest Rate (%)
          </label>
          <input
            type="number"
            value={interestRate}
            onChange={(e) => setInterestRate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Life Expectancy */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Life Expectancy (Years)
          </label>
          <select
            value={lifeExpectancy}
            onChange={(e) => setLifeExpectancy(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          >
            {lifeExpectancyOptions.map((years) => (
              <option key={years} value={years}>
                {years}
              </option>
            ))}
          </select>
        </div>

        {/* Annual Distribution */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Desired Annual Distribution ($)
          </label>
          <input
            type="number"
            value={annualDistribution}
            onChange={(e) => setAnnualDistribution(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* IRA Balance */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Current IRA Balance ($)
          </label>
          <input
            type="number"
            value={currentIRABalance}
            onChange={(e) => setCurrentIRABalance(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Return Rate */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Rate of Return (%)
          </label>
          <input
            type="number"
            value={returnRate}
            onChange={(e) => setReturnRate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>

        {/* Inflation Rate */}
        <div className="flex flex-col">
          <label className="block font-bold text-gray-700">
            Inflation Rate (%)
          </label>
          <input
            type="number"
            value={inflationRate}
            onChange={(e) => setInflationRate(e.target.value)}
            className="border border-gray-300 rounded-md p-2 w-full"
          />
        </div>
      </div>
      {/* Outputs */}
      <h3 className="leading-8 block font-bold text-gray-700">
        72(t) IRA Amount Needed: $
        {amountNeeded.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h3>
      <h3 className="leading-8 block font-bold text-gray-700">
        Remaining IRA Balance: $
        {remainingIRA.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </h3>
      {/* Table for growth every 5 years */}
      <h4 className="mt-6 text-3xl block font-bold text-gray-700">
        Projected Growth of Remaining IRA Balance
      </h4>
      <p>(Every 5 Years)</p>
      {renderTable()}
      <h4 className="mt-8 text-3xl block font-bold text-gray-700">
        Remaining Balance Growth
      </h4>
      <GraphComponent data={growthData} />
    </div>
  );
}

export default SeventyTwoTCalculator;
