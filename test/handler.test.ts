import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../services/SpacesTable/update";

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: "36594f21-d626-4843-afe7-f951cdd3fe52",
  },
  body: {
    location: "Florida, US",
    // score: 8.5,
    // name: "Miami"
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
