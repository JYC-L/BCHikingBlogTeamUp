import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api, { currentUser } from "../api";
import { renderAt } from "../testUtils";
import TrailsPage from "./TrailsPage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
  currentUser: jest.fn(),
}));

const trails = [
  {
    _id: "t1",
    name: "Grouse Grind",
    location: "North Vancouver, BC",
    difficulty: "Hard",
  },
];

test("searches trail profiles and lists matches", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({ data: trails });

  renderAt(<TrailsPage />, "/trails");

  expect(await screen.findByText("Grouse Grind")).toBeInTheDocument();
  expect(screen.getByText("North Vancouver, BC")).toBeInTheDocument();

  api.get.mockResolvedValue({ data: [] });
  await userEvent.type(screen.getByPlaceholderText("Search by name, place, or difficulty"), "zzz");

  expect(await screen.findByText("No trail profiles match that search.")).toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/api/trails", { params: { q: "zzz" } });
});
