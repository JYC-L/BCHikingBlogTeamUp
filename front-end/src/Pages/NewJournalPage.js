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

const NewJournalPage = () => {
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const presetTrail = new URLSearchParams(location.search).get("trail") || "";

  const [trails, setTrails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    trail: presetTrail,
    content: "",
    conditions: "",
    difficulty: "",
    distanceKm: "",
    elevationM: "",
    durationMinutes: "",
    tags: "",
  });
  const [file, setFile] = useState(null);

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
      let images = [];
      if (file) {
        const body = new FormData();
        body.append("file", file);
        const { data } = await api.post("/api/upload", body);
        images = [data.fileUrl];
      }
      await api.post("/api/blogs", {
        ...form,
        images,
        distanceKm: form.distanceKm ? Number(form.distanceKm) : undefined,
        elevationM: form.elevationM ? Number(form.elevationM) : undefined,
        durationMinutes: form.durationMinutes
          ? Number(form.durationMinutes)
          : undefined,
      });
      toast({ title: "Journal posted", status: "success", duration: 3000 });
      history.push("/feed");
    } catch (error) {
      toast({
        title: "Could not post the journal",
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
          New journal
        </Heading>
        <Box bg="white" p={6} borderRadius="lg" borderWidth="1px">
          <FormControl mb={3} isRequired>
            <FormLabel>Title</FormLabel>
            <Input value={form.title} onChange={setField("title")} />
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>Trail</FormLabel>
            <Select value={form.trail} onChange={setField("trail")} placeholder="Choose a trail">
              {trails.map((trail) => (
                <option key={trail._id} value={trail._id}>
                  {trail.name}
                </option>
              ))}
            </Select>
          </FormControl>
          <FormControl mb={3} isRequired>
            <FormLabel>What was it like?</FormLabel>
            <Textarea value={form.content} onChange={setField("content")} rows={6} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Conditions</FormLabel>
            <Input
              placeholder="Dry, cloudy, muddy"
              value={form.conditions}
              onChange={setField("conditions")}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Difficulty you felt</FormLabel>
            <Select value={form.difficulty} onChange={setField("difficulty")}>
              <option value="">Not set</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
              <option>Extremely challenging</option>
            </Select>
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Distance (km)</FormLabel>
            <Input type="number" value={form.distanceKm} onChange={setField("distanceKm")} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Elevation gain (m)</FormLabel>
            <Input type="number" value={form.elevationM} onChange={setField("elevationM")} />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Time (minutes)</FormLabel>
            <Input
              type="number"
              value={form.durationMinutes}
              onChange={setField("durationMinutes")}
            />
          </FormControl>
          <FormControl mb={3}>
            <FormLabel>Tags</FormLabel>
            <Input
              placeholder="snow, sunrise, dogs"
              value={form.tags}
              onChange={setField("tags")}
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Photo</FormLabel>
            <Input
              type="file"
              accept="image/*"
              p={1.5}
              onChange={(event) => setFile(event.target.files[0] || null)}
            />
          </FormControl>
          <Button colorScheme="green" width="100%" isLoading={loading} onClick={submit}>
            Post journal
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default NewJournalPage;
