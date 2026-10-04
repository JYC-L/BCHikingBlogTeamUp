import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api, { currentUser } from "../api";
import { renderAt } from "../testUtils";
import NewJournalPage from "./NewJournalPage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  currentUser: jest.fn(),
}));

test("posts a journal for the selected trail profile", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockResolvedValue({
    data: [{ _id: "t1", name: "Garibaldi Lake", location: "Garibaldi Provincial Park, BC" }],
  });
  api.post.mockResolvedValue({ data: { _id: "p1" } });

  renderAt(<NewJournalPage />, "/journals/new");

  expect(await screen.findByRole("option", { name: /Garibaldi Lake/ })).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText(/Title/), "Morning loop");
  await userEvent.selectOptions(screen.getByLabelText(/Trail profile/), "t1");
  await userEvent.type(screen.getByLabelText(/What was it like/), "Snow on the ridge.");
  await userEvent.click(screen.getByRole("button", { name: "Post journal" }));

  await waitFor(() =>
    expect(api.post).toHaveBeenCalledWith(
      "/api/blogs",
      expect.objectContaining({
        title: "Morning loop",
        trail: "t1",
        content: "Snow on the ridge.",
      })
    )
  );
});
