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
import { useHistory, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const formatDate = (value) =>
  new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const UserProfilePage = () => {
  const history = useHistory();
  const toast = useToast();
  const { id } = useParams();
  const me = currentUser();
  const [profile, setProfile] = useState(null);
  const [journals, setJournals] = useState([]);
  const [requests, setRequests] = useState([]);
  const [link, setLink] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    api
      .get(`/api/users/${id}`)
      .then(({ data }) => setProfile(data))
      .catch((err) => setError(err.response?.data?.message || "Could not open this profile."));
    api.get(`/api/blogs/user/${id}`).then(({ data }) => setJournals(data)).catch(() => setJournals([]));
    api
      .get(`/api/teamups/user/${id}`)
      .then(({ data }) => setRequests(data))
      .catch(() => setRequests([]));
    if (currentUser()?._id !== id) {
      api
        .get(`/api/connections/with/${id}`)
        .then(({ data }) => setLink(data.connection))
        .catch(() => setLink(null));
    }
  }, [history, id]);

  const connect = async () => {
    try {
      const { data } = await api.post("/api/connections", { userId: id });
      setLink(data);
      toast({
        title: data.status === "accepted" ? "You are already connected" : "Request sent",
        status: "success",
        duration: 3000,
      });
    } catch (err) {
      toast({
        title: "Could not send the request",
        description: err.response?.data?.message || "Try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const mine = me && me._id === id;

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        {error && <Text color="red.500">{error}</Text>}
        {!profile && !error && <Spinner />}
        {profile && (
          <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
            <Heading size="lg">{profile.username}</Heading>
            <Text color="gray.600" mt={1}>
              Hiking history and team-up requests
            </Text>
            {!mine && link?.status === "accepted" && (
              <Button mt={4} colorScheme="green" onClick={() => history.push(`/chat/${id}`)}>
                Open chat
              </Button>
            )}
            {!mine && link?.status === "pending" && link.requester?._id === me?._id && (
              <Button mt={4} isDisabled>
                Request sent
              </Button>
            )}
            {!mine && link?.status === "pending" && link.recipient?._id === me?._id && (
              <Button mt={4} onClick={() => history.push("/requests")}>
                Answer request
              </Button>
            )}
            {!mine && link?.status !== "accepted" && link?.status !== "pending" && (
              <Button mt={4} colorScheme="green" onClick={connect}>
                Request to connect
              </Button>
            )}
          </Box>
        )}

        <Heading size="md" mt={8} mb={3}>
          Journals
        </Heading>
        {profile && journals.length === 0 && <Text>No journals yet.</Text>}
        <Stack spacing={3}>
          {journals.map((post) => (
            <Box key={post._id} bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Heading size="sm">{post.title}</Heading>
              {post.trail?.name && (
                <Badge mt={2} colorScheme="purple">
                  {post.trail.name}
                </Badge>
              )}
              <Text mt={2}>{post.content}</Text>
            </Box>
          ))}
        </Stack>

        <Heading size="md" mt={8} mb={3}>
          Team-up requests
        </Heading>
        {profile && requests.length === 0 && <Text>No team-up requests yet.</Text>}
        <Stack spacing={3}>
          {requests.map((post) => (
            <Box key={post._id} bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Heading size="sm">{post.trail?.name || "Trail"}</Heading>
              <Stack direction="row" mt={2} wrap="wrap">
                <Badge>{formatDate(post.date)}</Badge>
                <Badge>{post.groupSize} people</Badge>
              </Stack>
              <Text mt={2}>{post.note}</Text>
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default UserProfilePage;
