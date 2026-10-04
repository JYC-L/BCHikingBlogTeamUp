import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, Input, Stack, Text } from "@chakra-ui/react";
import { useHistory, useParams } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const ChatPage = () => {
  const history = useHistory();
  const { userId } = useParams();
  const [hiker, setHiker] = useState(null);
  const [status, setStatus] = useState("");
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    if (!userId) return;
    api
      .get(`/api/connections/with/${userId}`)
      .then(({ data }) => {
        setStatus(data.status);
        const other =
          data.connection?.requester?._id === userId
            ? data.connection.requester
            : data.connection?.recipient;
        if (other?.username) setHiker(other);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not open this chat."));
  }, [history, userId]);

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="xl" py={8}>
        <Button variant="link" mb={4} onClick={() => history.push("/teamups")}>
          Back to team-ups
        </Button>
        <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
          <Heading size="md">{hiker ? `Chat with ${hiker.username}` : "Chat"}</Heading>
          <Text mt={2} color="gray.600">
            {status === "accepted"
              ? "Live messages are not connected yet. This page is a placeholder until chat is added."
              : "This chat stays closed until the connect request is accepted."}
          </Text>
          {error && (
            <Text mt={3} color="red.500">
              {error}
            </Text>
          )}
          <Stack mt={6} spacing={3}>
            <Box bg="gray.50" p={3} borderRadius="md">
              <Text fontSize="sm" color="gray.500">
                Say hello once live chat is available.
              </Text>
            </Box>
            <Input
              placeholder="Write a message"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              isDisabled
            />
            <Button isDisabled>Send</Button>
          </Stack>
        </Box>
      </Container>
    </Box>
  );
};

export default ChatPage;
