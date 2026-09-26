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
        Feed
      </Button>
      <Button variant="ghost" onClick={() => history.push("/trails")}>
        Trails
      </Button>
      <Spacer />
      {user ? (
        <>
          <Button colorScheme="green" onClick={() => history.push("/journals/new")}>
            Write journal
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
