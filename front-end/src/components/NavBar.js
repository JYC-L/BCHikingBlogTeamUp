import { Button, Flex, Heading, Spacer } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import { currentUser } from "../api";

const NavBar = () => {
  const history = useHistory();
  const user = currentUser();

  const logout = () => {
    localStorage.removeItem("userInfo");
    history.push("/");
  };

  return (
    <Flex
      align="center"
      px={6}
      py={3}
      bg="white"
      borderBottomWidth="1px"
      gap={3}
    >
      <Heading size="md" cursor="pointer" onClick={() => history.push("/feed")}>
        BC Hiking
      </Heading>
      <Button variant="ghost" onClick={() => history.push("/feed")}>
        Journals
      </Button>
      <Button variant="ghost" onClick={() => history.push("/teamups")}>
        Team up
      </Button>
      <Button variant="ghost" onClick={() => history.push("/trails")}>
        Trails
      </Button>
      <Spacer />
      {user ? (
        <>
          <Button variant="ghost" onClick={() => history.push("/requests")}>
            Requests
          </Button>
          <Button variant="ghost" onClick={() => history.push(`/users/${user._id}`)}>
            Profile
          </Button>
          <Button colorScheme="green" onClick={() => history.push("/journals/new")}>
            Write journal
          </Button>
          <Button colorScheme="purple" onClick={() => history.push("/teamups/new")}>
            New team-up
          </Button>
          <Button variant="outline" onClick={logout}>
            Log out
          </Button>
        </>
      ) : (
        <Button onClick={() => history.push("/")}>Log in</Button>
      )}
    </Flex>
  );
};

export default NavBar;
