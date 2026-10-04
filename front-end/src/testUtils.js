import { ChakraProvider } from "@chakra-ui/react";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

export function renderAt(ui, path = "/") {
  return render(
    <ChakraProvider>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </ChakraProvider>
  );
}
