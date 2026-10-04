import { screen } from "@testing-library/react";
import api, { currentUser } from "../api";
import { renderAt } from "../testUtils";
import TrailProfilePage from "./TrailProfilePage";

jest.mock("../api", () => ({
  __esModule: true,
  default: { get: jest.fn() },
  currentUser: jest.fn(),
}));

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "t1" }),
}));

test("shows the saved trail, a live forecast, and journals", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockImplementation((url) => {
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
    return Promise.resolve({
      data: [
        {
          _id: "p1",
          title: "Stairs in the trees",
          content: "Roots and stairs.",
          user: { username: "Ada" },
        },
      ],
    });
  });
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: async () => ({
      daily: {
        time: ["2026-10-02"],
        weather_code: [0],
        temperature_2m_max: [14.2],
        temperature_2m_min: [6.4],
        precipitation_probability_max: [10],
      },
    }),
  });

  renderAt(<TrailProfilePage />, "/trails/t1");

  expect(await screen.findByRole("heading", { name: "Grouse Grind" })).toBeInTheDocument();
  expect(screen.getByText("A steep forest climb.")).toBeInTheDocument();
  expect(screen.getByText(/It is not saved/)).toBeInTheDocument();
  expect(await screen.findByText("Clear")).toBeInTheDocument();
  expect(screen.getByText("6° / 14°C")).toBeInTheDocument();
  expect(screen.getByText("Stairs in the trees")).toBeInTheDocument();
  expect(global.fetch).toHaveBeenCalledWith(expect.stringContaining("api.open-meteo.com"));
});

test("says when nobody has posted about the trail", async () => {
  currentUser.mockReturnValue({ username: "Ada", token: "token" });
  api.get.mockImplementation((url) => {
    if (url === "/api/trails/t1") {
      return Promise.resolve({
        data: {
          _id: "t1",
          name: "Quarry Rock",
          location: "Deep Cove, North Vancouver, BC",
          difficulty: "Easy",
          length: "3.8 km",
          elevation: "100 m",
          routeType: "Out and back",
          rating: 4.6,
          description: "A short walk.",
          latitude: 49.3554,
          longitude: -122.9638,
        },
      });
    }
    return Promise.resolve({ data: [] });
  });
  global.fetch = jest.fn().mockResolvedValue({ ok: false });

  renderAt(<TrailProfilePage />, "/trails/t1");

  expect(await screen.findByText("No one has posted about this trail yet.")).toBeInTheDocument();
  expect(
    await screen.findByText("The 7-day forecast is unavailable right now.")
  ).toBeInTheDocument();
});
