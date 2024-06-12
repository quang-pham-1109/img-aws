import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import { aws_s3 as s3, aws_lambda as lambda } from "aws-cdk-lib";
import { Architecture, Runtime } from "aws-cdk-lib/aws-lambda";

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";

export class ImgAwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageBucket = new s3.Bucket(this, "image-bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const imageGetSignedUrlS3 = new NodejsFunction(
      this,
      "image-get-signed-url-s3",
      {
        runtime: Runtime.NODEJS_20_X,
        entry: path.join(
          __dirname,
          "../src/handlers/image-get-signed-url-s3/index.js"
        ),
        handler: "handler",
        environment: {
          BUCKET_NAME: imageBucket.bucketName,
        },
      }
    );

    const generateThumbnail = new NodejsFunction(this, "generate-thumbnail", {
      runtime: Runtime.NODEJS_20_X,
      entry: path.join(
        __dirname,
        "../src/handlers/generate-thumbnail/index.js"
      ),
      handler: "handler",
      timeout: cdk.Duration.seconds(40),
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
      },
      bundling: {
        nodeModules: ["jimp"],
      },
    });

    generateThumbnail.addEventSource(
      new eventsources.S3EventSource(imageBucket, {
        events: [s3.EventType.OBJECT_CREATED],
        filters: [{ prefix: "uploads/" }], // triggered only for files in the uploads/ directory
      })
    );

    imageBucket.grantPut(imageGetSignedUrlS3);

    imageBucket.grantRead(generateThumbnail);
    imageBucket.grantPut(generateThumbnail);

    const api = new apigateway.RestApi(this, "image-api");

    const imgResource = api.root.addResource("img");

    const imageModel = api.addModel("ImageModel", {
      contentType: "application/json",
      modelName: "ImageModel",
      schema: {
        schema: apigateway.JsonSchemaVersion.DRAFT4,
        title: "image",
        type: apigateway.JsonSchemaType.OBJECT,
        properties: {
          files: {
            type: apigateway.JsonSchemaType.ARRAY,
            items: {
              type: apigateway.JsonSchemaType.OBJECT,
              properties: {
                name: { type: apigateway.JsonSchemaType.STRING },
                size: { type: apigateway.JsonSchemaType.INTEGER },
              },
              required: ["name", "size"],
            },
          },
        },
        required: ["files"],
      },
    });

    imgResource.addMethod("POST", new LambdaIntegration(imageGetSignedUrlS3), {
      requestModels: { "application/json": imageModel },
      requestValidatorOptions: {
        requestValidatorName: "ImageGetSignedUrlS3Validator",
        validateRequestBody: true,
      },
    });

    // const requestValidator = new apigateway.RequestValidator(
    //   this,
    //   "RequestValidator",
    //   {
    //     restApi: api,
    //     validateRequestBody: true,
    //     validateRequestParameters: false,
    //   }
    // );
  }
}
