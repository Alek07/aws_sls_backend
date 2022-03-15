import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { v4 } from "uuid";
import { addCorsHeader } from "../../utils/functions";

const TABLE_NAME = process.env.TABLE_NAME as string;
const PRIMARY_KEY = process.env.PRIMARY_KEY as string;
const dbClient = new DynamoDB.DocumentClient();

const handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const result: APIGatewayProxyResult = {
    statusCode: 200,
    body: "Hello from DynamoDb",
  };

  addCorsHeader(result);

  try {
    const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

    if (spaceId) {
      const deleteResult = await dbClient
        .delete({
          TableName: TABLE_NAME,
          Key: {
            [PRIMARY_KEY]: spaceId,
          },
        })
        .promise();

      result.body = JSON.stringify(deleteResult);
    }
  } catch (error) {
    if (error instanceof Error) {
      result.body = error.message;
    }
  }

  return result;
};

export { handler };
