import { DynamoDB } from "aws-sdk";
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";
import { isValidSpace } from "../../utils/type-guards";
import { getEventBody } from "../../utils/functions";

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

  const requestBody = getEventBody(event);
  const spaceId = event.queryStringParameters?.[PRIMARY_KEY];

  if (requestBody && spaceId)
    try {
      isValidSpace(requestBody);

      let updtExp = "set";
      let ExpAttrKeys: any = {};
      let ExpAttrValues: any = {};

      const requestBodyKey = Object.keys(requestBody);
      const requestBodyValue = Object.values(requestBody);

      requestBodyKey.forEach((key, index) => {
        updtExp += ` #key${index} = :val${index}${
          index + 1 === requestBodyKey.length ? "" : ","
        }`;
        ExpAttrKeys[`#key${index}`] = key;
      });

      requestBodyValue.forEach((values, index) => {
        ExpAttrValues[`:val${index}`] = values;
      });

      const updateResults = await dbClient
        .update({
          TableName: TABLE_NAME,
          Key: {
            [PRIMARY_KEY]: spaceId,
          },
          UpdateExpression: updtExp,
          ExpressionAttributeNames: ExpAttrKeys,
          ExpressionAttributeValues: ExpAttrValues,
          ReturnValues: "UPDATED_NEW",
        })
        .promise();

      result.body = JSON.stringify(updateResults);
    } catch (error) {
      if (error instanceof Error) {
        result.body = error.message;
      }
    }

  return result;
};

export { handler };
