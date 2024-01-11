import { useEffect, useRef } from "react";
import * as d3 from "d3";

import styles from "./Graph.module.css";

export function Graph(props: {
  data: [number, number][];
  xMax: number;
  xMin: number;
  yMax: number;
}) {
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

    const xScale = d3
      .scaleLinear([props.xMin, props.xMax], [marginSides, width - marginSides])
      .clamp(true);

    const yScale = d3.scaleLinear(
      [0, props.yMax],
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
      .curve(d3.curveBasis)(props.data);

    d3.select(lineRef.current)
      .attr("d", line)
      .attr("fill", "lightblue")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2);

    console.timeEnd();
  }, [props.data, props.xMax, props.xMin, props.yMax]);

  return (
    <svg className={styles.graph} ref={svgRef}>
      <path ref={lineRef} />
      <g ref={xAxisRef} />
      <g ref={yAxisRef} />
    </svg>
  );
}
