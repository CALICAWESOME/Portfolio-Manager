import { useEffect, useRef } from "react";
import * as d3 from "d3";

import styles from "./Graph.module.css";
import { NormalDistribution } from "../../mobx";
import { observer } from "mobx-react-lite";

// binWidth: number;
// data: [number, number][];
// histogramData: [number, number][];
// xMax: number;
// xMin: number;
// yMax: number;

export const Graph = observer(
  (props: {
    normalDistribution: NormalDistribution;
    xMin?: number;
    xMax?: number;
    yMax?: number;
  }) => {
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
      const marginLeft = 30;
      const marginRight = 10;
      const marginTop = 10;
      const width = svgDomRect.width;

      const graphData = props.normalDistribution.graphData.coordinates;

      // Guard for xMin, xMax, or yMax === 0 (thanks, Javascript)
      const xMin = props.xMin === undefined ? graphData[0][0] : props.xMin;
      const xMax =
        props.xMax === undefined
          ? graphData[graphData.length - 1][0]
          : props.xMax;

      const yMax =
        props.yMax === undefined
          ? Math.max(
              props.normalDistribution.graphData.yMax,
              props.normalDistribution.histogram.data?.y_max || 0
            )
          : props.yMax;

      const xScale = d3
        .scaleLinear([xMin, xMax], [marginLeft, width - marginRight])
        .clamp(true);

      const yScale = d3.scaleLinear(
        [0, yMax],
        [height - marginBottom, marginTop]
      );

      // Add the x-axis.
      d3.select(xAxisRef.current)
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(d3.axisBottom(xScale).ticks(5));

      // Add the y-axis.
      d3.select(yAxisRef.current)
        .attr("transform", `translate(${marginLeft},0)`)
        .call(d3.axisLeft(yScale).ticks(5));

      // Add the histogram (if it exists)
      if (props.normalDistribution.histogram.data.histogram)
        d3.select(svgRef.current)
          .selectAll("rect")
          .data(props.normalDistribution.histogram.data.histogram)
          .join("rect")
          .attr("fill", "red")
          .attr("height", ([_, y]) => height - marginBottom - yScale(y))
          .attr("width", 5)
          .attr("x", ([x]) => xScale(x))
          .attr("y", ([_, y]) => yScale(y));

      // d3.select(areaRef.current)
      //   .attr(
      //     "d",
      //     d3
      //       .area()
      //       .x(([x, _]) => xScale(x))
      //       .y0(height - marginBottom)
      //       .y1(([_, y]) => yScale(y))(
      //       // .curve(d3.curveBasis)
      //       props.normalDistribution.graphData.coordinates
      //     )
      //   )
      //   .attr("fill", "lightblue");

      // d3.select(lineRef.current)
      //   .attr(
      //     "d",
      //     d3
      //       .line()
      //       .x(([x, _]) => xScale(x))
      //       .y(([_, y]) => yScale(y))(
      //       // .curve(d3.curveBasis)
      //       props.normalDistribution.graphData.coordinates
      //     )
      //   )
      //   .attr("fill", "none")
      //   .attr("stroke", "steelblue")
      //   .attr("stroke-width", 2);

      console.timeEnd();
    }, [
      props.normalDistribution.graphData,
      props.normalDistribution.histogram.data.histogram,
    ]);

    return (
      <svg className={styles.graph} ref={svgRef}>
        <path ref={areaRef} />
        <path ref={lineRef} />
        <g ref={xAxisRef} />
        <g ref={yAxisRef} />
      </svg>
    );
  }
);
