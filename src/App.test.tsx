import React from "react";
import { render, screen } from "@testing-library/react";
import { App } from "./App";
import { Steps } from "./mobx";

const steps = new Steps();

test("renders learn react link", () => {
  render(<App steps={steps} />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
