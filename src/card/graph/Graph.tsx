import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { erf } from "mathjs";

import styles from "./Graph.module.css";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));
const STANDARD_CDF = (x: number) => 0.5 * (1 + erf(x / Math.sqrt(2)));
const SKEWED_PDF = (x: number, skew: number) =>
  2 * STANDARD_PDF(x) * STANDARD_CDF(skew * x);

d3.range(-3.5, 3.5, 0.01).map((x) => {
  const y = SKEWED_PDF(x, 0);
  console.log(x, y);
});

export function Graph(props: { skew: number }) {
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);
  const lineRef = useRef<SVGPathElement>(null);

  useEffect(() => {
    if (!(xAxisRef.current && yAxisRef.current && lineRef.current)) {
      return;
    }

    // Declare the chart dimensions and margins.
    const width = 240;
    const height = 150;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 30;

    const xScale = d3.scaleLinear(
      [-2.71, 2.71],
      [marginLeft, width - marginRight]
    );
    const yScale = d3
      .scaleLinear([0, 1], [height - marginBottom, marginTop])
      .nice();

    // Add the x-axis.
    d3.select(xAxisRef.current)
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale));

    // Add the y-axis.
    d3.select(yAxisRef.current)
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale));

    const line = (d3.line() as d3.Line<number>)
      .x((datum) => xScale(datum))
      .y((datum) => yScale(SKEWED_PDF(datum, props.skew)))
      .curve(d3.curveBasis)(d3.range(-2.71, 2.71, 0.01));

    d3.select(lineRef.current)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);
  }, [props.skew]);

  return (
    <svg className={styles.graph}>
      <g ref={xAxisRef} />
      <g ref={yAxisRef} />
      <path ref={lineRef} />
    </svg>
  );
}
