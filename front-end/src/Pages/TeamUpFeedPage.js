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
  useToast,
} from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const TeamUpFeedPage = () => {
  const history = useHistory();
  const toast = useToast();
  const me = currentUser();
  const [posts, setPosts] = useState([]);
  const [links, setLinks] = useState({ incoming: [], outgoing: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    Promise.all([api.get("/api/teamups"), api.get("/api/connections/mine")])
      .then(([postsResponse, linksResponse]) => {
        setPosts(postsResponse.data);
        setLinks(linksResponse.data);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load team-up requests."))
      .finally(() => setLoading(false));
  }, [history]);

  const outgoingFor = (userId) => links.outgoing.find((item) => item.recipient?._id === userId);
  const incomingFor = (userId) => links.incoming.find((item) => item.requester?._id === userId);

  const connect = async (post) => {
    try {
      const { data } = await api.post("/api/connections", {
        userId: post.user._id,
        teamUpId: post._id,
      });
      setLinks((current) => ({
        ...current,
        outgoing: [data, ...current.outgoing.filter((item) => item._id !== data._id)],
      }));
      toast({
        title: data.status === "accepted" ? "You are already connected" : "Request sent",
        status: "success",
        duration: 3000,
      });
      if (data.status === "accepted") history.push(`/chat/${post.user._id}`);
    } catch (err) {
      toast({
        title: "Could not send the request",
        description: err.response?.data?.message || "Try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading size="lg" mb={6}>
          Team-up feed
        </Heading>
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        {!loading && posts.length === 0 && (
          <Text>No team-up requests yet. Post one and choose a trail profile.</Text>
        )}
        <Stack spacing={4}>
          {posts.map((post) => {
            const mine = me && post.user?._id === me._id;
            return (
              <Box key={post._id} bg="white" p={5} borderRadius="lg" borderWidth="1px">
                <Text
                  fontSize="sm"
                  color="purple.600"
                  cursor="pointer"
                  fontWeight="semibold"
                  onClick={() => history.push(`/users/${post.user?._id}`)}
                >
                  {post.user?.username || "Hiker"}
                </Text>
                <Heading size="md" mt={1}>
                  {post.trail?.name || "Trail"}
                </Heading>
                <Stack direction="row" mt={3} wrap="wrap">
                  <Badge colorScheme="purple">{formatDate(post.date)}</Badge>
                  <Badge>{post.groupSize} people</Badge>
                  {post.trail?.location && <Badge colorScheme="gray">{post.trail.location}</Badge>}
                </Stack>
                <Text mt={3} whiteSpace="pre-wrap">
                  {post.note}
                </Text>
                {post.details && (
                  <Text mt={2} color="gray.600">
                    {post.details}
                  </Text>
                )}
                {!mine &&
                  post.user?._id &&
                  (outgoingFor(post.user._id)?.status === "accepted" ||
                    incomingFor(post.user._id)?.status === "accepted") && (
                    <Button
                      mt={4}
                      colorScheme="green"
                      size="sm"
                      onClick={() => history.push(`/chat/${post.user._id}`)}
                    >
                      Open chat
                    </Button>
                  )}
                {!mine && post.user?._id && outgoingFor(post.user._id)?.status === "pending" && (
                  <Button mt={4} size="sm" isDisabled>
                    Request sent
                  </Button>
                )}
                {!mine && post.user?._id && incomingFor(post.user._id)?.status === "pending" && (
                  <Button mt={4} size="sm" onClick={() => history.push("/requests")}>
                    Answer request
                  </Button>
                )}
                {!mine &&
                  post.user?._id &&
                  outgoingFor(post.user._id)?.status !== "pending" &&
                  outgoingFor(post.user._id)?.status !== "accepted" &&
                  incomingFor(post.user._id)?.status !== "pending" &&
                  incomingFor(post.user._id)?.status !== "accepted" && (
                    <Button mt={4} colorScheme="green" size="sm" onClick={() => connect(post)}>
                      Request to connect
                    </Button>
                  )}
              </Box>
            );
          })}
        </Stack>
      </Container>
    </Box>
  );
};

export default TeamUpFeedPage;
