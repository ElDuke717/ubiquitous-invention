// MonthlyExpensesGraph.js
import React from "react";
import { Bar } from "@visx/shape";
import { Group } from "@visx/group";
import { scaleBand, scaleLinear } from "@visx/scale";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { Text } from "@visx/text";

const margin = { top: 40, right: 30, bottom: 50, left: 50 };

const MonthlyExpensesGraph = ({ expenses }) => {
  const width = 600;
  const height = 400;

  const data = [];
  Object.keys(expenses).forEach((category) => {
    const total = Object.values(expenses[category]).reduce(
      (sum, amount) => sum + amount,
      0
    );
    data.push({ category, total });
  });

  const xMax = width - margin.left - margin.right;
  const yMax = height - margin.top - margin.bottom;

  // Scales
  const xScale = scaleBand({
    domain: data.map((d) => d.category),
    padding: 0.3,
    range: [0, xMax],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => d.total))],
    range: [yMax, 0],
    nice: true,
  });

  return (
    <svg width={width} height={height}>
      <Group top={margin.top} left={margin.left}>
        {data.map((d) => {
          const barWidth = xScale.bandwidth();
          const barHeight = yMax - yScale(d.total);
          const barX = xScale(d.category);
          const barY = yMax - barHeight;

          return (
            <Group key={d.category}>
              <Bar
                x={barX}
                y={barY}
                width={barWidth}
                height={barHeight}
                fill="teal"
              />
              <Text
                x={barX + barWidth / 2}
                y={barY - 5}
                textAnchor="middle"
                verticalAnchor="end"
                fontSize={12}
                fill="black"
              >
                {d.total.toFixed(2)}
              </Text>
            </Group>
          );
        })}

        {/* Left axis */}
        <AxisLeft scale={yScale} label="Spent ($)" />
        {/* Bottom axis */}
        <AxisBottom scale={xScale} top={yMax} />
      </Group>
    </svg>
  );
};

export default MonthlyExpensesGraph;
