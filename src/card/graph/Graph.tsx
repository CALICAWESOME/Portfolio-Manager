import { useEffect, useRef } from "react";
import * as d3 from "d3";

import styles from "./Graph.module.css";

const PDF_COEFF = 1 / Math.sqrt(2 * Math.PI);
const STANDARD_PDF = (x: number) => PDF_COEFF * Math.exp(-0.5 * Math.pow(x, 2));

export function Graph() {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const svg = d3.select(ref.current);

    // Declare the chart dimensions and margins.
    const width = 240;
    const height = 150;
    const marginTop = 10;
    const marginRight = 10;
    const marginBottom = 20;
    const marginLeft = 30;

    const xScale = d3.scaleLinear(
      [-3.5, 3.5],
      [marginLeft, width - marginRight]
    );
    const yScale = d3
      .scaleLinear([0, STANDARD_PDF(0)], [height - marginBottom, marginTop])
      .nice();

    const line = d3
      .line()
      // @ts-ignore
      .x((datum) => xScale(datum))
      // @ts-ignore
      .y((datum) => yScale(STANDARD_PDF(datum)))
      .curve(d3.curveBasis);

    // Add the x-axis.
    svg
      .append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(xScale));

    // Add the y-axis.
    svg
      .append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(yScale));

    svg
      .append("path")
      .datum(d3.range(-3.5, 3.5, 0.01))
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 2)
      // @ts-ignore
      .attr("d", line);

    const bbox = ref.current.getBBox();
    console.log(bbox);
  }, []);

  return <svg className={styles.graph} ref={ref} />;
}
