import { Space } from "../models/space";
import { SpaceScheme } from "./constants";
import { isOptional } from "./functions";

// Check if the object can be a Space type
export const isValidSpace = (obj: any): obj is Space => {
  const isValidObj = Object.keys(obj).every((obj_key) =>
    Object.keys(SpaceScheme).includes(obj_key)
  );

  if (!isValidObj)
    throw new Error(`request have one or more invalid properties`);

  return isValidObj;
};

// Check if there is no missing required property
export const isValidSpaceInput = (input: any): input is Space => {
  if (isValidSpace(input)) {
    Object.keys(SpaceScheme)
      .filter((key) => isOptional(SpaceScheme[key as keyof Space]))
      .filter((key) => input[key as keyof Space] === undefined)
      .forEach((key) => {
        throw new Error(`request is missing property ${key}`);
      });
  } else {
    return false;
  }

  return true;
};
