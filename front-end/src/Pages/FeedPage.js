import { useEffect, useState } from "react";
import {
  Badge,
  Box,
  Container,
  Heading,
  Image,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const FeedPage = () => {
  const history = useHistory();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    api
      .get("/api/blogs")
      .then(({ data }) => setPosts(data))
      .catch((err) => setError(err.response?.data?.message || "Could not load the feed."))
      .finally(() => setLoading(false));
  }, [history]);

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading size="lg" mb={6}>
          Journal feed
        </Heading>
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        {!loading && posts.length === 0 && (
          <Text>No journals yet. Write one and choose a trail profile for it.</Text>
        )}
        <Stack spacing={4}>
          {posts.map((post) => (
            <Box key={post._id} bg="white" p={5} borderRadius="lg" borderWidth="1px">
              <Text fontSize="sm" color="gray.600">
                {post.user?.username || "Hiker"}
              </Text>
              <Heading size="md" mt={1}>
                {post.title}
              </Heading>
              {post.trail?.name && (
                <Badge mt={2} colorScheme="purple">
                  {post.trail.name}
                </Badge>
              )}
              <Stack direction="row" mt={3} wrap="wrap">
                {post.difficulty && <Badge>{post.difficulty}</Badge>}
                {post.distanceKm != null && <Badge>{post.distanceKm} km</Badge>}
                {post.elevationM != null && <Badge>{post.elevationM} m gain</Badge>}
                {post.durationMinutes != null && (
                  <Badge>{post.durationMinutes} min</Badge>
                )}
                {post.conditions && <Badge colorScheme="blue">{post.conditions}</Badge>}
                {(post.tags || []).map((tag) => (
                  <Badge key={tag} colorScheme="green">
                    {tag}
                  </Badge>
                ))}
              </Stack>
              <Text mt={3} whiteSpace="pre-wrap">
                {post.content}
              </Text>
              {(post.images || []).map((url) => (
                <Image key={url} src={url} alt="" mt={3} borderRadius="md" maxH="320px" />
              ))}
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default FeedPage;
