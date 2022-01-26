import { handler } from "../services/SpacesTables/create";

const event = {
  body: {
    location: "Venice",
  },
};

handler(event as any, {} as any);
