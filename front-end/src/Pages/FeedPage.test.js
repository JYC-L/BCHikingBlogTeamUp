import { screen, waitFor } from "@testing-library/react";
import api, { currentUser } from "../api";
import { renderAt } from "../testUtils";
import FeedPage from "./FeedPage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
  currentUser: jest.fn(),
}));

test("shows journals and the trail each one was written about", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({
    data: [
      {
        _id: "p1",
        title: "Stairs in the trees",
        content: "Roots and stairs.",
        user: { username: "Ada" },
        trail: { name: "Grouse Grind" },
        tags: ["forest"],
        difficulty: "Hard",
      },
    ],
  });

  renderAt(<FeedPage />, "/feed");

  expect(await screen.findByText("Stairs in the trees")).toBeInTheDocument();
  expect(screen.getByText("Grouse Grind")).toBeInTheDocument();
  expect(screen.getByText("Ada")).toBeInTheDocument();
  expect(screen.queryByText("Trail profiles")).not.toBeInTheDocument();
  expect(api.get).toHaveBeenCalledWith("/api/blogs");
});

test("shows an empty feed", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({ data: [] });

  renderAt(<FeedPage />, "/feed");

  expect(
    await screen.findByText("No journals yet. Write one and choose a trail profile for it.")
  ).toBeInTheDocument();
});

test("sends a logged-out visitor home", async () => {
  currentUser.mockReturnValue(null);
  renderAt(<FeedPage />, "/feed");
  await waitFor(() => expect(api.get).not.toHaveBeenCalled());
});
