import React from "react";
import { scaleLinear } from "@visx/scale";
import { LinePath } from "@visx/shape";
import { AxisBottom, AxisLeft } from "@visx/axis";
import { curveMonotoneX } from "@visx/curve"; // Correct import from Visx

function GraphComponent({ data }) {
  // Define graph dimensions
  const width = 900;
  const height = 600;
  const margin = { top: 20, bottom: 50, left: 50, right: 20 };

  // Create scales
  const xScale = scaleLinear({
    domain: [
      Math.min(...data.map((d) => d.year)),
      Math.max(...data.map((d) => d.year)),
    ],
    range: [margin.left, width - margin.right],
  });

  const yScale = scaleLinear({
    domain: [0, Math.max(...data.map((d) => d.balance))],
    range: [height - margin.bottom, margin.top],
  });

  return (
    <svg width={width} height={height}>
      {/* Line Path */}
      <LinePath
        data={data}
        x={(d) => xScale(d.year)}
        y={(d) => yScale(d.balance)}
        stroke="#1f77b4"
        strokeWidth={2}
        curve={curveMonotoneX} // Use Visx's built-in curve function
      />

      {/* X-Axis */}
      <AxisBottom
        scale={xScale}
        top={height - margin.bottom}
        label="Year"
        stroke="#333"
        tickStroke="#333"
        tickLabelProps={() => ({
          fill: "#333",
          fontSize: 10,
          textAnchor: "middle",
        })}
      />

      {/* Y-Axis */}
      <AxisLeft
        scale={yScale}
        left={margin.left}
        label="Balance ($)"
        stroke="#333"
        tickStroke="#333"
        labelProps={{
          fill: "#333",
          fontSize: 12, // Adjust the size of the axis label here
          textAnchor: "middle",
        }}
        tickLabelProps={() => ({
          fill: "#333",
          fontSize: 10,
          textAnchor: "end",
          dy: "0.5em",
        })}
      />
    </svg>
  );
}

export default GraphComponent;
