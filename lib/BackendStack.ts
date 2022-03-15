import { CfnOutput, Fn, Stack, StackProps } from "aws-cdk-lib";
import {
  AuthorizationType,
  LambdaIntegration,
  MethodOptions,
  RestApi,
} from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Bucket, HttpMethods } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";
import { join } from "path";
import { AuthorizerWrapper } from "./auth/AuthorizerWrapper";
import { GenericTable } from "./GenericTable";

export class BackendStack extends Stack {
  private api = new RestApi(this, "SpaceFinderAPI");
  private authorizer: AuthorizerWrapper;
  private suffix: string;
  private spacesPhotosBucket: Bucket;

  private spacesTable = new GenericTable(this, {
    tableName: "SpacesTable",
    primaryKey: "spaceId",
    createLambdaPath: "create",
    readLambdaPath: "read",
    updateLambdaPath: "update",
    deleteLambdaPath: "delete",
    secondaryIndexes: ["location"],
  });

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.initializeSuffix();
    this.initializeSpacesPhotosBucket();
    this.authorizer = new AuthorizerWrapper(
      this,
      this.api,
      this.spacesPhotosBucket.bucketArn + "/*"
    );

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
        authorizerId: this.authorizer.authorizer.authorizerId,
      },
    };

    //Spaces API integrations:
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);
  }

  private initializeSuffix() {
    const shortStackId = Fn.select(2, Fn.split("/", this.stackId));
    const Suffix = Fn.select(4, Fn.split("-", shortStackId));
    this.suffix = Suffix;
  }

  private initializeSpacesPhotosBucket() {
    this.spacesPhotosBucket = new Bucket(this, "spaces-photos", {
      bucketName: "spaces-photos-" + this.suffix,
      cors: [
        {
          allowedMethods: [HttpMethods.HEAD, HttpMethods.GET, HttpMethods.PUT],
          allowedOrigins: ["*"],
          allowedHeaders: ["*"],
        },
      ],
    });
    new CfnOutput(this, "spaces-photos-bucket-name", {
      value: this.spacesPhotosBucket.bucketName,
    });
  }
}
