import { screen } from "@testing-library/react";
import api, { currentUser } from "../api";
import { renderAt } from "../testUtils";
import UserProfilePage from "./UserProfilePage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn() },
  currentUser: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "ada" }),
}));

test("shows journals and past team-up requests", async () => {
  currentUser.mockReturnValue({ _id: "beau", username: "Beau", token: "token" });
  api.get.mockImplementation((url) => {
    if (url === "/api/connections/with/ada") {
      return Promise.resolve({ data: { status: "none", connection: null } });
    }
    if (url === "/api/users/ada") return Promise.resolve({ data: { _id: "ada", username: "Ada" } });
    if (url === "/api/blogs/user/ada") {
      return Promise.resolve({
        data: [{ _id: "j1", title: "Stairs in the trees", content: "Roots.", trail: { name: "Grouse Grind" } }],
      });
    }
    return Promise.resolve({
      data: [
        {
          _id: "r1",
          date: "2026-10-18T12:00:00",
          groupSize: 3,
          note: "Easy pace.",
          trail: { name: "Quarry Rock" },
        },
      ],
    });
  });

  renderAt(<UserProfilePage />, "/users/ada");

  expect(await screen.findByRole("heading", { name: "Ada" })).toBeInTheDocument();
  expect(await screen.findByText("Stairs in the trees")).toBeInTheDocument();
  expect(screen.getByText("Quarry Rock")).toBeInTheDocument();
  expect(screen.getByText("Easy pace.")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Request to connect" })).toBeInTheDocument();
});
