import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";

// Check if scheme property is optional
export const isOptional = (value: any) => {
  return value && value !== "optional";
};

export const getEventBody = (event: APIGatewayProxyEvent) => {
  return typeof event.body === "object" ? event.body : JSON.parse(event.body);
};

export function addCorsHeader(result: APIGatewayProxyResult) {
  result.headers = {
    "Content-type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
  };
}
