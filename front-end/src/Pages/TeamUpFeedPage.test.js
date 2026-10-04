import { ChakraProvider } from "@chakra-ui/react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createMemoryHistory } from "history";
import { Router } from "react-router-dom";
import api, { currentUser } from "../api";
import TeamUpFeedPage from "./TeamUpFeedPage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  currentUser: jest.fn(),
}));

test("shows a team-up request and connects to that hiker", async () => {
  const history = createMemoryHistory({ initialEntries: ["/teamups"] });
  currentUser.mockReturnValue({ _id: "me", username: "Beau", token: "token" });
  api.get.mockImplementation((url) => {
    if (url === "/api/connections/mine") {
      return Promise.resolve({ data: { incoming: [], outgoing: [] } });
    }
    return Promise.resolve({
    data: [
      {
        _id: "r1",
        date: "2026-10-18T12:00:00",
        groupSize: 3,
        note: "Easy pace.",
        details: "Deep Cove lot.",
        user: { _id: "ada", username: "Ada" },
        trail: { name: "Quarry Rock", location: "Deep Cove, North Vancouver, BC" },
      },
    ],
    });
  });
  api.post.mockResolvedValue({
    data: { _id: "c1", status: "pending", recipient: { _id: "ada", username: "Ada" } },
  });

  render(
    <ChakraProvider>
      <Router history={history}>
        <TeamUpFeedPage />
      </Router>
    </ChakraProvider>
  );

  expect(await screen.findByText("Quarry Rock")).toBeInTheDocument();
  expect(screen.getByText("Easy pace.")).toBeInTheDocument();
  expect(screen.getByText("3 people")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Request to connect" }));
  expect(api.post).toHaveBeenCalledWith("/api/connections", { userId: "ada", teamUpId: "r1" });
  expect(await screen.findByRole("button", { name: "Request sent" })).toBeDisabled();
  expect(history.location.pathname).toBe("/teamups");
});
