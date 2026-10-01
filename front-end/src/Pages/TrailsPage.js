import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Container,
  Heading,
  Input,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const TrailsPage = () => {
  const history = useHistory();
  const [query, setQuery] = useState("");
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    const handle = setTimeout(() => {
      setLoading(true);
      api
        .get("/api/trails", { params: { q: query } })
        .then(({ data }) => setTrails(data))
        .catch((err) => setError(err.response?.data?.message || "Could not search trails."))
        .finally(() => setLoading(false));
    }, 200);
    return () => clearTimeout(handle);
  }, [history, query]);

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading size="lg" mb={4}>
          Trail profiles
        </Heading>
        <Input
          bg="white"
          mb={6}
          placeholder="Search by name, place, or difficulty"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        {!loading && trails.length === 0 && <Text>No trail profiles match that search.</Text>}
        <Stack spacing={3}>
          {trails.map((trail) => (
            <Box
              key={trail._id}
              bg="white"
              p={4}
              borderRadius="lg"
              borderWidth="1px"
              cursor="pointer"
              onClick={() => history.push(`/trails/${trail._id}`)}
            >
              <Heading size="sm">{trail.name}</Heading>
              <Text color="gray.600" mt={1}>
                {trail.location}
              </Text>
              <Badge mt={2}>{trail.difficulty}</Badge>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default TrailsPage;
