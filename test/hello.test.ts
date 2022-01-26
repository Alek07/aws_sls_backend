import { handler } from "../services/SpacesTable/create";

const event = {
  body: {
    location: "Venice",
  },
};

handler(event as any, {} as any);
