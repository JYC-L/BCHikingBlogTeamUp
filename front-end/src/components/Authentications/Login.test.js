import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import api from "../../api";
import { renderAt } from "../../testUtils";
import Login from "./Login";

jest.mock("../../api", () => ({
  __esModule: true,
  default: { post: jest.fn() },
  currentUser: jest.fn(),
}));

test("stores the account and leaves the login form after a successful login", async () => {
  api.post.mockResolvedValue({
    data: { username: "Ada", email: "ada@example.com", token: "token" },
  });

  renderAt(<Login />);
  await userEvent.type(screen.getByPlaceholderText("Enter Your Email Address"), "ada@example.com");
  await userEvent.type(screen.getByPlaceholderText("Enter password"), "secret1");
  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  await waitFor(() => expect(api.post).toHaveBeenCalledWith("/api/users/login", {
    email: "ada@example.com",
    password: "secret1",
  }));
  expect(JSON.parse(localStorage.getItem("userInfo")).username).toBe("Ada");
});

test("asks for both fields before calling the API", async () => {
  api.post.mockClear();
  renderAt(<Login />);
  await userEvent.click(screen.getByRole("button", { name: "Login" }));
  expect(api.post).not.toHaveBeenCalled();
});
