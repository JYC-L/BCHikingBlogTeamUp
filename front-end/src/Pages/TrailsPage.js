import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Button,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const TrailsPage = () => {
  const history = useHistory();
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    api
      .get("/api/trails")
      .then(({ data }) => setTrails(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load trails."))
      .finally(() => setLoading(false));
  }, [history]);

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="5xl" py={8}>
        <Heading size="lg" mb={6}>
          Trails
        </Heading>
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {trails.map((trail) => (
            <Box key={trail._id} bg="white" p={5} borderRadius="lg" borderWidth="1px">
              <Heading size="md">{trail.name}</Heading>
              <Text color="gray.600" mt={1}>
                {trail.location}
              </Text>
              <Box mt={3}>
                <Badge mr={2}>{trail.difficulty}</Badge>
                <Badge mr={2}>{trail.length}</Badge>
                <Badge>{trail.elevation}</Badge>
              </Box>
              <Text mt={3}>{trail.description}</Text>
              <Text fontSize="sm" color="gray.500" mt={2}>
                {trail.latitude.toFixed(4)}, {trail.longitude.toFixed(4)} · {trail.routeType}
              </Text>
              <Button
                mt={4}
                size="sm"
                colorScheme="green"
                onClick={() => history.push(`/journals/new?trail=${trail._id}`)}
              >
                Write about this trail
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  );
};

export default TrailsPage;
