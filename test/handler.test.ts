import { APIGatewayProxyEvent } from "aws-lambda";
import { handler } from "../services/SpacesTable/read";

const event: APIGatewayProxyEvent = {
  queryStringParameters: {
    spaceId: "36594f21-d626-4843-afe7-f951cdd3fe52",
  },
} as any;

const result = handler({} as any, {} as any).then((apiResult) => {
  const items = JSON.parse(apiResult.body);
  console.log("parse response!");
});
