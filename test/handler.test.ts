import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../services/SpacesTable/update";

const event: APIGatewayProxyEvent = {
  body: {
    name: "Tijuana",
  },
  queryStringParameters: {
    spaceId: "3e87d614-cbb7-4005-a0b5-b1e8bbf8d9fd",
  },
} as any;

try {
  const result = handler(event, {} as any).then((apiResult) => {
    const items = apiResult.body;
    console.log("parse response!");
  });
} catch (error) {
  console.log(error);
}
