import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyEventQueryStringParameters,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const TABLE_NAME = process.env.TABLE_NAME;
const PRIMARY_KEY = process.env.PRIMARY_KEY;
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
    if (event.queryStringParameters) {
      if (PRIMARY_KEY! in event.queryStringParameters)
        result.body = await queryWithPrimaryPartition(
          event.queryStringParameters
        );
      else
        result.body = await queryWithSecondaryPartition(
          event.queryStringParameters
        );
    } else {
      result.body = await getAllSpaces();
    }
  } catch (error) {
    if (error instanceof Error) {
      result.body = error.message;
    }
  }
  return result;
};

const getAllSpaces = async () => {
  const queryResponse = await dbClient
    .scan({
      TableName: TABLE_NAME!,
    })
    .promise();
  return JSON.stringify(queryResponse);
};

const queryWithPrimaryPartition = async (
  queryParams: APIGatewayProxyEventQueryStringParameters
) => {
  const keyValue = queryParams[PRIMARY_KEY!];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": PRIMARY_KEY!,
      },
      ExpressionAttributeValues: {
        ":id": keyValue,
      },
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
};

const queryWithSecondaryPartition = async (
  queryParams: APIGatewayProxyEventQueryStringParameters
) => {
  const queryKey = Object.keys(queryParams)[0];
  const queryValue = queryParams[queryKey];
  const queryResponse = await dbClient
    .query({
      TableName: TABLE_NAME!,
      IndexName: queryKey,
      KeyConditionExpression: "#id = :id",
      ExpressionAttributeNames: {
        "#id": queryKey,
      },
      ExpressionAttributeValues: {
        ":id": queryValue,
      },
    })
    .promise();
  return JSON.stringify(queryResponse.Items);
};

export { handler };
