import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const describeWeather = (code) => {
  if (code === 0) return "Clear";
  if (code <= 3) return "Cloudy";
  if (code === 45 || code === 48) return "Fog";
  if (code >= 51 && code <= 67) return "Rain";
  if (code >= 71 && code <= 77) return "Snow";
  if (code >= 80 && code <= 82) return "Showers";
  if (code >= 95) return "Thunder";
  return "Mixed";
};

const TrailProfilePage = () => {
  const history = useHistory();
  const { id } = useParams();
  const [trail, setTrail] = useState(null);
  const [journals, setJournals] = useState([]);
  const [journalsLoaded, setJournalsLoaded] = useState(false);
  const [forecast, setForecast] = useState([]);
  const [weatherError, setWeatherError] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    api
      .get(`/api/trails/${id}`)
      .then(({ data }) => setTrail(data))
      .catch((err) => setError(err.response?.data?.message || "Could not open this trail."));
    api
      .get(`/api/blogs/trail/${id}`)
      .then(({ data }) => setJournals(data))
      .catch(() => setJournals([]))
      .finally(() => setJournalsLoaded(true));
  }, [history, id]);

  useEffect(() => {
    if (!trail) return;
    const params = new URLSearchParams({
      latitude: String(trail.latitude),
      longitude: String(trail.longitude),
      daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
      forecast_days: "7",
      timezone: "auto",
    });
    fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
      .then((response) => {
        if (!response.ok) throw new Error("weather failed");
        return response.json();
      })
      .then((data) => {
        const daily = data.daily || {};
        const days = (daily.time || []).map((date, index) => ({
          date,
          label: describeWeather(daily.weather_code[index]),
          high: daily.temperature_2m_max[index],
          low: daily.temperature_2m_min[index],
          rain: daily.precipitation_probability_max[index],
        }));
        setForecast(days);
      })
      .catch(() => setWeatherError("The 7-day forecast is unavailable right now."));
  }, [trail]);

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Button variant="link" mb={4} onClick={() => history.push("/trails")}>
          Back to search
        </Button>
        {error && <Text color="red.500">{error}</Text>}
        {!trail && !error && <Spinner />}
        {trail && (
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
            <Heading size="lg">{trail.name}</Heading>
            <Text color="gray.600" mt={1}>
              {trail.location}
            </Text>
            <Stack direction="row" mt={3} wrap="wrap">
              <Badge>{trail.difficulty}</Badge>
              <Badge>{trail.length}</Badge>
              <Badge>{trail.elevation}</Badge>
              <Badge>{trail.routeType}</Badge>
              {trail.rating != null && <Badge colorScheme="yellow">{trail.rating} rating</Badge>}
            </Stack>
            <Text mt={4}>{trail.description}</Text>
            <Text fontSize="sm" color="gray.500" mt={3}>
              {trail.latitude.toFixed(4)}, {trail.longitude.toFixed(4)}
            </Text>
            <Box mt={6} p={4} borderWidth="1px" borderRadius="md" bg="gray.50">
              <Heading size="sm">Next 7 days</Heading>
              <Text fontSize="sm" color="gray.600" mt={1}>
                Live forecast for this trail. It is not saved.
              </Text>
              {weatherError && (
                <Text color="red.500" mt={3}>
                  {weatherError}
                </Text>
              )}
              {!weatherError && forecast.length === 0 && <Spinner mt={3} />}
              <Stack direction="row" mt={3} spacing={3} overflowX="auto">
                {forecast.map((day) => (
                  <Box key={day.date} minW="110px" bg="white" p={3} borderRadius="md" borderWidth="1px">
                    <Text fontSize="sm" fontWeight="bold">
                      {new Date(`${day.date}T12:00:00`).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </Text>
                    <Text mt={1}>{day.label}</Text>
                    <Text fontSize="sm">
                      {Math.round(day.low)}° / {Math.round(day.high)}°C
                    </Text>
                    <Text fontSize="sm" color="gray.600">
                      {day.rain}% rain
                    </Text>
                  </Box>
                ))}
              </Stack>
            </Box>
            <Button
              mt={5}
              colorScheme="green"
              onClick={() => history.push(`/journals/new?trail=${trail._id}`)}
            >
              Write a journal about this trail
            </Button>
          </Box>
        )}
        <Heading size="md" mt={8} mb={3}>
          Journals on this trail
        </Heading>
        {journalsLoaded && journals.length === 0 && (
          <Text>No one has posted about this trail yet.</Text>
        )}
        <Stack spacing={3}>
          {journals.map((post) => (
            <Box key={post._id} bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontSize="sm" color="gray.600">
                {post.user?.username || "Hiker"}
              </Text>
              <Heading size="sm" mt={1}>
                {post.title}
              </Heading>
              <Text mt={2}>{post.content}</Text>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default TrailProfilePage;
