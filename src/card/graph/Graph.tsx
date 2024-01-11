import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { erf } from "mathjs";

import styles from "./Graph.module.css";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
const SKEWED_PDF = (x: number, skew: number) =>
  2 * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

const Y_MIN = 0.0044318484119380075;

export function Graph(props: { skew: number }) {
  const lineRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (
      !(
        lineRef.current &&
        svgRef.current &&
        xAxisRef.current &&
        yAxisRef.current
      )
    ) {
      return;
    }

    const svgDomRect = svgRef.current.getBoundingClientRect();

    console.time();
    // Declare the chart dimensions and margins.
    const height = svgDomRect.height;
    const marginBottom = 20;
    const marginSides = 30;
    const marginTop = 10;
    const width = svgDomRect.width;

    const data = d3.range(0, 8, 0.01).reduce(
      (accumulator, x) => {
        const y = SKEWED_PDF(x - 4, props.skew);

        // Push coordinates to data
        accumulator.coordinates.push([x, y]);

        // Find max y value for y-axis clamping
        if (y > accumulator.yMax) {
          accumulator.yMax = y;
        }

        return accumulator;
      },
      {
        coordinates: [] as [number, number][],
        yMax: 0,
      }
    );

    const xScale = d3
      .scaleLinear([1, 7], [marginSides, width - marginSides])
      .clamp(true);

    const yScale = d3.scaleLinear(
      [0, data.yMax],
      [height - marginBottom, marginTop]
    );

    // Add the x-axis.
    d3.select(xAxisRef.current)
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale).ticks(5));

    // Add the y-axis.
    d3.select(yAxisRef.current)
      .attr("transform", `translate(${marginSides},0)`)
      .call(d3.axisLeft(yScale).ticks(5));

    const line = d3
      .line()
      .x(([x, _]) => xScale(x))
      .y(([_, y]) => yScale(y))
      .curve(d3.curveBasis)(data.coordinates);

    d3.select(lineRef.current)
      .attr("d", line)
      .attr("fill", "lightblue")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    console.timeEnd();
  }, [props.skew]);

  return (
    <svg className={styles.graph} ref={svgRef}>
      <path ref={lineRef} />
      <g ref={xAxisRef} />
      <g ref={yAxisRef} />
    </svg>
  );
}
