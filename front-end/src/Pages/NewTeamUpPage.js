import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Select,
  Textarea,
  useToast,
} from "@chakra-ui/react";
import { useHistory, useLocation } from "react-router-dom";
import NavBar from "../components/NavBar";
import api, { currentUser } from "../api";

const NewTeamUpPage = () => {
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const presetTrail = new URLSearchParams(location.search).get("trail") || "";
  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    trail: presetTrail,
    date: "",
    groupSize: "2",
    note: "",
    details: "",
  });

  useEffect(() => {
    if (!currentUser()) {
      history.push("/");
      return;
    }
    api.get("/api/trails").then(({ data }) => setTrails(data));
  }, [history]);

  const setField = (key) => (event) =>
    setForm((current) => ({ ...current, [key]: event.target.value }));

  const submit = async () => {
    setLoading(true);
    try {
      await api.post("/api/teamups", {
        ...form,
        groupSize: Number(form.groupSize),
      });
      toast({ title: "Team-up posted", status: "success", duration: 3000 });
      history.push("/teamups");
    } catch (error) {
      toast({
        title: "Could not post the request",
        description: error.response?.data?.message || "Try again.",
        status: "error",
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box minH="100vh" bg="gray.50" textAlign="left">
      <NavBar />
      <Container maxW="xl" py={8}>
        <Heading size="lg" mb={6}>
          New team-up
        </Heading>
        <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
          <FormControl mb={3} isRequired>
            <FormLabel>Trail profile</FormLabel>
            <Select value={form.trail} onChange={setField("trail")} placeholder="Choose a trail profile">
              {trails.map((trail) => (
                <option key={trail._id} value={trail._id}>
                  {trail.name}
                  {trail.location ? ` — ${trail.location}` : ""}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Date</FormLabel>
            <Input type="date" value={form.date} onChange={setField("date")} />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Group size</FormLabel>
            <Input type="number" min={2} value={form.groupSize} onChange={setField("groupSize")} />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Say hi</FormLabel>
            <Textarea
              value={form.note}
              onChange={setField("note")}
              rows={4}
              placeholder="A short note to introduce yourself"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Other information</FormLabel>
            <Textarea
              value={form.details}
              onChange={setField("details")}
              rows={3}
              placeholder="Pace, experience, meeting place"
            />
          </FormControl>
          <Button colorScheme="green" width="100%" isLoading={loading} onClick={submit}>
            Post request
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NewTeamUpPage;
