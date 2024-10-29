import { useEffect, useRef } from "react";
import * as d3 from "d3";

import styles from "./OutputGraph.module.css";
import { HistogramData, Steps } from "../mobx";
import { observer } from "mobx-react-lite";

// binWidth: number;
// data: [number, number][];
// histogramData: [number, number][];
// xMax: number;
// xMin: number;
// yMax: number;

export const OutputGraph = (props: { histogramData: HistogramData }) => {
  const areaRef = useRef<SVGPathElement>(null);
  const lineRef = useRef<SVGPathElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const xAxisRef = useRef<SVGGElement>(null);
  const yAxisRef = useRef<SVGGElement>(null);

  useEffect(() => {
    if (
      !(
        areaRef.current &&
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

    const histogram = props.histogramData.histogram;
    const xMin = histogram[0][0];
    const xMax = histogram[histogram.length - 1][0];

    const xScale = d3
      .scaleLinear([xMin, xMax], [marginSides, width - marginSides])
      .clamp(true);

    const yScale = d3.scaleLinear(
      [0, props.histogramData.y_max],
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

    // Add the histogram (if it exists)
    // if (props.normalDistribution.histogram.length)
    if (props.histogramData.histogram)
      d3.select(svgRef.current)
        .selectAll("rect")
        .data(props.histogramData.histogram)
        .join("rect")
        .attr("fill", "blue")
        .attr("height", ([_, y]) => height - marginBottom - yScale(y))
        .attr("width", 7.75)
        .attr("x", ([x]) => xScale(x))
        .attr("y", ([_, y]) => yScale(y));

    console.timeEnd();
  }, [props.histogramData]);

  return (
    <svg className={styles["output-graph"]} ref={svgRef}>
      <path ref={areaRef} />
      <path ref={lineRef} />
      <g ref={xAxisRef} />
      <g ref={yAxisRef} />
    </svg>
  );
};
