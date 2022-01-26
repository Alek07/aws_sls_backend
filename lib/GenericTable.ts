import { Stack } from "aws-cdk-lib";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

export class GenericTable {
  private name: string;
  private primaryKey: string;
  private stack: Stack;

  public constructor(name: string, primaryKey: string, stack: Stack) {
    this.name = name;
    this.primaryKey = primaryKey;
    this.stack = stack;

    this.initialize();
  }

  private initialize() {
    this.createTable();
  }

  private createTable() {
    new Table(this.stack, this.name, {
      partitionKey: {
        name: this.primaryKey,
        type: AttributeType.STRING,
      },
      tableName: this.name,
    });
  }
}
