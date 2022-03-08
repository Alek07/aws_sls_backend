import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";
import { isValidSpaceInput } from "../../utils/type-guards";
import { getEventBody } from "../../utils/functions";

const TABLE_NAME = process.env.TABLE_NAME;
const dbClient = new DynamoDB.DocumentClient();

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDb",
  };

  try {
    const item = getEventBody(event);
    item.spaceId = v4();

    isValidSpaceInput(item);

    await dbClient
      .put({
        TableName: TABLE_NAME!,
        Item: item,
      })
      .promise();

    result.body = JSON.stringify(`Created item with id: ${item.spaceId}`);
  } catch (error) {
    if (error instanceof Error) {
      result.body = error.message;
    }
  }

  return result;
};

export { handler };
