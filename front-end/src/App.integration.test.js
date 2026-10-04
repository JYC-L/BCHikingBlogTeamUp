import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChakraProvider } from "@chakra-ui/react";
import { MemoryRouter } from "react-router-dom";
import { render } from "@testing-library/react";
import App from "./App";
import api, { currentUser } from "./api";

jest.mock("./api", () => {
  const realCurrentUser = jest.requireActual("./api").currentUser;
  return {
    __esModule: true,
    default: { get: jest.fn(), post: jest.fn() },
    currentUser: jest.fn(realCurrentUser),
  };
});

function renderApp() {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={["/"]}>
        <App />
      </MemoryRouter>
    </ChakraProvider>
  );
}

test("logs in, reads the journal feed, then opens a trail profile", async () => {
  localStorage.clear();
  currentUser.mockImplementation(() => {
    const raw = localStorage.getItem("userInfo");
    return raw ? JSON.parse(raw) : null;
  });
  api.post.mockResolvedValue({
    data: { username: "Ada", email: "ada@example.com", token: "token" },
  });
  api.get.mockImplementation((url) => {
    if (url === "/api/blogs") {
      return Promise.resolve({
        data: [
          {
            _id: "p1",
            title: "Stairs in the trees",
            content: "Roots and stairs.",
            user: { username: "Ada" },
            trail: { name: "Grouse Grind" },
            tags: [],
          },
        ],
      });
    }
    if (url === "/api/trails") {
      return Promise.resolve({
        data: [
          {
            _id: "t1",
            name: "Grouse Grind",
            location: "North Vancouver, BC",
            difficulty: "Hard",
          },
        ],
      });
    }
    if (url === "/api/trails/t1") {
      return Promise.resolve({
        data: {
          _id: "t1",
          name: "Grouse Grind",
          location: "North Vancouver, BC",
          difficulty: "Hard",
          length: "2.9 km",
          elevation: "853 m",
          routeType: "Out and back",
          rating: 4.4,
          description: "A steep forest climb.",
          latitude: 49.3722,
          longitude: -123.0993,
        },
      });
    }
    if (url === "/api/blogs/trail/t1") {
      return Promise.resolve({ data: [] });
    }
    return Promise.resolve({ data: [] });
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      daily: {
        time: ["2026-10-02"],
        weather_code: [61],
        temperature_2m_max: [11],
        temperature_2m_min: [7],
        precipitation_probability_max: [50],
      },
    }),
  });

  renderApp();

  expect(screen.getByText("Hiker's Connect")).toBeInTheDocument();
  await userEvent.type(screen.getAllByPlaceholderText("Enter Your Email Address")[0], "ada@example.com");
  await userEvent.type(screen.getByPlaceholderText("Enter password"), "secret1");
  await userEvent.click(screen.getByRole("button", { name: "Login" }));

  expect(await screen.findByText("Journal feed")).toBeInTheDocument();
  expect(await screen.findByText("Stairs in the trees")).toBeInTheDocument();

  await userEvent.click(screen.getByRole("button", { name: "Trails" }));
  expect(await screen.findByRole("heading", { name: "Trail profiles" })).toBeInTheDocument();
  await userEvent.click(await screen.findByText("Grouse Grind"));

  expect(await screen.findByText("Next 7 days")).toBeInTheDocument();
  expect(await screen.findByText("Rain")).toBeInTheDocument();
  expect(screen.getByText(/It is not saved/)).toBeInTheDocument();
  expect(await screen.findByText("No one has posted about this trail yet.")).toBeInTheDocument();
});
