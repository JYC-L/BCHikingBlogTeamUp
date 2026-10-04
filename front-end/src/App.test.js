import { screen } from "@testing-library/react";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import App from "./App";

jest.mock("./api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  currentUser: jest.fn(() => null),
}));

test("opens on the login screen", () => {
  render(
    <ChakraProvider>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </ChakraProvider>
  );
  expect(screen.getByText("Hiker's Connect")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Login" })).toBeInTheDocument();
});
