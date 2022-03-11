import { Stack, StackProps } from "aws-cdk-lib";
import { AuthorizationType, LambdaIntegration, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Construct } from "constructs";
import { join } from "path";
import { AuthorizerWrapper } from "./AuthorizerWrapper";
import { GenericTable } from "./GenericTable";

export class BackendStack extends Stack {
  private api = new RestApi(this, "SpaceFinderAPI");
  private authorizer: AuthorizerWrapper;

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

    this.authorizer = new AuthorizerWrapper(this, this.api);

    const helloLambdaNodeJS = new NodejsFunction(this, "helloLambdaNodejs", {
      entry: join(__dirname, "..", "services", "node-lambda", "hello.ts"),
      handler: "handler",
    });

    const optionsWithAuthorizer: MethodOptions = {
      authorizationType: AuthorizationType.COGNITO,
      authorizer: {
          authorizerId: this.authorizer.authorizer.authorizerId
      }
  }

    const s3ListPolicy = new PolicyStatement();
    s3ListPolicy.addActions("s3:ListAllMyBuckets");
    s3ListPolicy.addResources("*");
    helloLambdaNodeJS.addToRolePolicy(s3ListPolicy);

    // API Gateway integration
    const helloLambdaIntegration = new LambdaIntegration(helloLambdaNodeJS);
    const helloLambdaResource = this.api.root.addResource("hello");
    helloLambdaResource.addMethod("GET", helloLambdaIntegration, optionsWithAuthorizer);

    //Spaces API integrations:
    const spaceResource = this.api.root.addResource("spaces");
    spaceResource.addMethod("POST", this.spacesTable.createLambdaIntegration);
    spaceResource.addMethod("GET", this.spacesTable.readLambdaIntegration);
    spaceResource.addMethod("PUT", this.spacesTable.updateLambdaIntegration);
    spaceResource.addMethod("DELETE", this.spacesTable.deleteLambdaIntegration);
  }
}
