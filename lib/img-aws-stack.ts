import * as path from "node:path";

import * as cdk from "aws-cdk-lib";
import { Runtime } from "aws-cdk-lib/aws-lambda";

import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as sqs from "aws-cdk-lib/aws-sqs";
import * as cloudwatch from "aws-cdk-lib/aws-cloudwatch";
import * as logs from "aws-cdk-lib/aws-logs";
import * as sns from "aws-cdk-lib/aws-sns";
import { LambdaIntegration } from "aws-cdk-lib/aws-apigateway";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as cw_actions from "aws-cdk-lib/aws-cloudwatch-actions";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3n from "aws-cdk-lib/aws-s3-notifications";

// import * as s3 from "aws-cdk-lib/aws-s3";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { GENERATE_THUMBNAIL_LAMBDA_FUNCTION_TIME } from "./constants";

export class ImgAwsStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const imageBucket = new s3.Bucket(this, "image-bucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const generateThumbnailLogGroup = new logs.LogGroup(
      this,
      "generate-thumbnail-log-group"
    );

    const imageTooLargeMetricFilter = new logs.MetricFilter(
      this,
      "image-too-large-metric-filter",
      {
        logGroup: generateThumbnailLogGroup,
        filterPattern: logs.FilterPattern.literal("Image is too large"),
        metricNamespace: "image-thumbnail-metrics",
        metricName: "ImageTooLarge",
        metricValue: "1",
      }
    );

    const imageTooLargeTopic = new sns.Topic(this, "image-too-large-topic");

    new sns.Subscription(this, "EmailSubscription", {
      topic: imageTooLargeTopic,
      protocol: sns.SubscriptionProtocol.EMAIL,
      endpoint: "quang.pham@codeleap.de",
    });

    const alarm = new cloudwatch.Alarm(this, "image-too-large-alarm", {
      metric: new cloudwatch.Metric({
        namespace: imageTooLargeMetricFilter.metric().namespace,
        metricName: imageTooLargeMetricFilter.metric().metricName,
        statistic: "Sum",
        period: cdk.Duration.minutes(1),
      }),
      threshold: 1,
      evaluationPeriods: 1,
    });

    alarm.addAlarmAction(new cw_actions.SnsAction(imageTooLargeTopic));

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
      timeout: cdk.Duration.seconds(GENERATE_THUMBNAIL_LAMBDA_FUNCTION_TIME),
      environment: {
        BUCKET_NAME: imageBucket.bucketName,
      },
      bundling: {
        nodeModules: ["jimp"],
      },
      logGroup: generateThumbnailLogGroup,
    });

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

    const generateThumbnailQueue = new sqs.Queue(
      this,
      "generate-thumbnail-queue",
      {
        visibilityTimeout: cdk.Duration.seconds(
          GENERATE_THUMBNAIL_LAMBDA_FUNCTION_TIME
        ),
      }
    );

    imageBucket.addEventNotification(
      s3.EventType.OBJECT_CREATED,
      new s3n.SqsDestination(generateThumbnailQueue),
      { prefix: "uploads/" }
    );

    generateThumbnail.addEventSource(
      new eventsources.SqsEventSource(generateThumbnailQueue, {
        maxBatchingWindow: cdk.Duration.seconds(5),
        batchSize: 1000,
        maxConcurrency: 20,
      })
    );
  }
}
