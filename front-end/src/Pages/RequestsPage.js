import { useEffect, useState } from "react";
import { Box, Button, Container, Heading, Spinner, Stack, Text, useToast } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const RequestsPage = () => {
  const history = useHistory();
  const toast = useToast();
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    api
      .get("/api/connections/mine")
      .then(({ data }) => {
        setIncoming(data.incoming);
        setOutgoing(data.outgoing);
      })
      .catch((err) => setError(err.response?.data?.message || "Could not load requests."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    load();
  }, [history]);

  const answer = async (id, decision) => {
    try {
      await api.post(`/api/connections/${id}/${decision}`);
      load();
    } catch (err) {
      toast({
        title: "Could not update the request",
        description: err.response?.data?.message || "Try again.",
        status: "error",
        duration: 4000,
      });
    }
  };

  const otherName = (item, side) =>
    (side === "incoming" ? item.requester : item.recipient)?.username || "Hiker";

  const otherId = (item, side) => (side === "incoming" ? item.requester : item.recipient)?._id;

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="3xl" py={8}>
        <Heading size="lg" mb={6}>
          Connect requests
        </Heading>
        {loading && <Spinner />}
        {error && <Text color="red.500">{error}</Text>}
        <Heading size="md" mb={3}>
          Incoming
        </Heading>
        {!loading && incoming.length === 0 && <Text mb={6}>No one has asked to connect yet.</Text>}
        <Stack spacing={3} mb={8}>
          {incoming.map((item) => (
            <Box key={item._id} bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="semibold">{otherName(item, "incoming")}</Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {item.status}
              </Text>
              {item.status === "pending" && (
                <Stack direction="row" mt={3}>
                  <Button size="sm" colorScheme="green" onClick={() => answer(item._id, "accept")}>
                    Accept
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => answer(item._id, "decline")}>
                    Decline
                  </Button>
                </Stack>
              )}
              {item.status === "accepted" && (
                <Button mt={3} size="sm" onClick={() => history.push(`/chat/${otherId(item, "incoming")}`)}>
                  Open chat
                </Button>
              )}
            </Box>
          ))}
        </Stack>
        <Heading size="md" mb={3}>
          Sent
        </Heading>
        {!loading && outgoing.length === 0 && <Text>You have not sent a connect request.</Text>}
        <Stack spacing={3}>
          {outgoing.map((item) => (
            <Box key={item._id} bg="white" p={4} borderRadius="lg" borderWidth="1px">
              <Text fontWeight="semibold">{otherName(item, "outgoing")}</Text>
              <Text fontSize="sm" color="gray.600" mt={1}>
                {item.status === "pending" ? "Waiting for a reply" : item.status}
              </Text>
              {item.status === "accepted" && (
                <Button mt={3} size="sm" onClick={() => history.push(`/chat/${otherId(item, "outgoing")}`)}>
                  Open chat
                </Button>
              )}
            </Box>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default RequestsPage;
