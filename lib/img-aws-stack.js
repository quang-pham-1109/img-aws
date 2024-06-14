"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImgAwsStack = void 0;
const cdk = require("aws-cdk-lib");
const aws_cdk_lib_1 = require("aws-cdk-lib");
const apigateway = require("aws-cdk-lib/aws-apigateway");
class ImgAwsStack extends cdk.Stack {
    constructor(scope, id, props) {
        super(scope, id, props);
        // init the S3 bucket
        const imageBucket = new aws_cdk_lib_1.aws_s3.Bucket(this, "image-bucket");
        imageBucket.grantPut(new aws_cdk_lib_1.aws_iam.AnyPrincipal(), `${imageBucket.bucketArn}/*`);
        const imageUploadLambdaRole = new aws_cdk_lib_1.aws_iam.Role(this, "LambdaRole", {
            assumedBy: new aws_cdk_lib_1.aws_iam.ServicePrincipal("lambda.amazonaws.com"),
        });
        const imageUploadLambdaPolicy = new aws_cdk_lib_1.aws_iam.PolicyStatement({
            resources: [imageBucket.bucketArn, `${imageBucket.bucketArn}/*`],
            actions: ["s3:PutObject"],
            effect: aws_cdk_lib_1.aws_iam.Effect.ALLOW,
        });
        imageUploadLambdaRole.addToPolicy(imageUploadLambdaPolicy);
        const imageUploadLambda = new aws_cdk_lib_1.aws_lambda.Function(this, "img-upload-lambda", {
            runtime: aws_cdk_lib_1.aws_lambda.Runtime.NODEJS_20_X,
            handler: "index.handler",
            code: aws_cdk_lib_1.aws_lambda.Code.fromAsset("handlers/image-upload"),
            role: imageUploadLambdaRole,
        });
        const api = new apigateway.LambdaRestApi(this, "img-upload-api", {
            handler: imageUploadLambda,
            proxy: false,
        });
        const imgResource = api.root.addResource("img");
        imgResource.addMethod("POST");
    }
}
exports.ImgAwsStack = ImgAwsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW1nLWF3cy1zdGFjay5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImltZy1hd3Mtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLDZDQU1xQjtBQUNyQix5REFBeUQ7QUFFekQsTUFBYSxXQUFZLFNBQVEsR0FBRyxDQUFDLEtBQUs7SUFDeEMsWUFBWSxLQUFjLEVBQUUsRUFBVSxFQUFFLEtBQXNCO1FBQzVELEtBQUssQ0FBQyxLQUFLLEVBQUUsRUFBRSxFQUFFLEtBQUssQ0FBQyxDQUFDO1FBRXhCLHFCQUFxQjtRQUNyQixNQUFNLFdBQVcsR0FBRyxJQUFJLG9CQUFFLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQztRQUV4RCxXQUFXLENBQUMsUUFBUSxDQUFDLElBQUkscUJBQUcsQ0FBQyxZQUFZLEVBQUUsRUFBRSxHQUFHLFdBQVcsQ0FBQyxTQUFTLElBQUksQ0FBQyxDQUFDO1FBRTNFLE1BQU0scUJBQXFCLEdBQUcsSUFBSSxxQkFBRyxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQzdELFNBQVMsRUFBRSxJQUFJLHFCQUFHLENBQUMsZ0JBQWdCLENBQUMsc0JBQXNCLENBQUM7U0FDNUQsQ0FBQyxDQUFDO1FBRUgsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLHFCQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RELFNBQVMsRUFBRSxDQUFDLFdBQVcsQ0FBQyxTQUFTLEVBQUUsR0FBRyxXQUFXLENBQUMsU0FBUyxJQUFJLENBQUM7WUFDaEUsT0FBTyxFQUFFLENBQUMsY0FBYyxDQUFDO1lBQ3pCLE1BQU0sRUFBRSxxQkFBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLO1NBQ3pCLENBQUMsQ0FBQztRQUVILHFCQUFxQixDQUFDLFdBQVcsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDO1FBRTNELE1BQU0saUJBQWlCLEdBQUcsSUFBSSx3QkFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsbUJBQW1CLEVBQUU7WUFDdkUsT0FBTyxFQUFFLHdCQUFNLENBQUMsT0FBTyxDQUFDLFdBQVc7WUFDbkMsT0FBTyxFQUFFLGVBQWU7WUFDeEIsSUFBSSxFQUFFLHdCQUFNLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyx1QkFBdUIsQ0FBQztZQUNwRCxJQUFJLEVBQUUscUJBQXFCO1NBQzVCLENBQUMsQ0FBQztRQUVILE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLGFBQWEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDL0QsT0FBTyxFQUFFLGlCQUFpQjtZQUMxQixLQUFLLEVBQUUsS0FBSztTQUNiLENBQUMsQ0FBQztRQUVILE1BQU0sV0FBVyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2hELFdBQVcsQ0FBQyxTQUFTLENBQUMsTUFBTSxDQUFDLENBQUM7SUFDaEMsQ0FBQztDQUNGO0FBcENELGtDQW9DQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tIFwiYXdzLWNkay1saWJcIjtcbmltcG9ydCB7XG4gIGF3c19zMyBhcyBzMyxcbiAgYXdzX2xhbWJkYSBhcyBsYW1iZGEsXG4gIGF3c19hcGlnYXRld2F5djIgYXMgYXBpZ3csXG4gIGF3c19hcGlnYXRld2F5djJfaW50ZWdyYXRpb25zIGFzIGFwaWd3X2ludGVncmF0aW9ucyxcbiAgYXdzX2lhbSBhcyBpYW0sXG59IGZyb20gXCJhd3MtY2RrLWxpYlwiO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tIFwiYXdzLWNkay1saWIvYXdzLWFwaWdhdGV3YXlcIjtcblxuZXhwb3J0IGNsYXNzIEltZ0F3c1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IGNkay5BcHAsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIGluaXQgdGhlIFMzIGJ1Y2tldFxuICAgIGNvbnN0IGltYWdlQnVja2V0ID0gbmV3IHMzLkJ1Y2tldCh0aGlzLCBcImltYWdlLWJ1Y2tldFwiKTtcblxuICAgIGltYWdlQnVja2V0LmdyYW50UHV0KG5ldyBpYW0uQW55UHJpbmNpcGFsKCksIGAke2ltYWdlQnVja2V0LmJ1Y2tldEFybn0vKmApO1xuXG4gICAgY29uc3QgaW1hZ2VVcGxvYWRMYW1iZGFSb2xlID0gbmV3IGlhbS5Sb2xlKHRoaXMsIFwiTGFtYmRhUm9sZVwiLCB7XG4gICAgICBhc3N1bWVkQnk6IG5ldyBpYW0uU2VydmljZVByaW5jaXBhbChcImxhbWJkYS5hbWF6b25hd3MuY29tXCIpLFxuICAgIH0pO1xuXG4gICAgY29uc3QgaW1hZ2VVcGxvYWRMYW1iZGFQb2xpY3kgPSBuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICByZXNvdXJjZXM6IFtpbWFnZUJ1Y2tldC5idWNrZXRBcm4sIGAke2ltYWdlQnVja2V0LmJ1Y2tldEFybn0vKmBdLFxuICAgICAgYWN0aW9uczogW1wiczM6UHV0T2JqZWN0XCJdLFxuICAgICAgZWZmZWN0OiBpYW0uRWZmZWN0LkFMTE9XLFxuICAgIH0pO1xuXG4gICAgaW1hZ2VVcGxvYWRMYW1iZGFSb2xlLmFkZFRvUG9saWN5KGltYWdlVXBsb2FkTGFtYmRhUG9saWN5KTtcblxuICAgIGNvbnN0IGltYWdlVXBsb2FkTGFtYmRhID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCBcImltZy11cGxvYWQtbGFtYmRhXCIsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgaGFuZGxlcjogXCJpbmRleC5oYW5kbGVyXCIsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoXCJoYW5kbGVycy9pbWFnZS11cGxvYWRcIiksXG4gICAgICByb2xlOiBpbWFnZVVwbG9hZExhbWJkYVJvbGUsXG4gICAgfSk7XG5cbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5MYW1iZGFSZXN0QXBpKHRoaXMsIFwiaW1nLXVwbG9hZC1hcGlcIiwge1xuICAgICAgaGFuZGxlcjogaW1hZ2VVcGxvYWRMYW1iZGEsXG4gICAgICBwcm94eTogZmFsc2UsXG4gICAgfSk7XG5cbiAgICBjb25zdCBpbWdSZXNvdXJjZSA9IGFwaS5yb290LmFkZFJlc291cmNlKFwiaW1nXCIpO1xuICAgIGltZ1Jlc291cmNlLmFkZE1ldGhvZChcIlBPU1RcIik7XG4gIH1cbn1cbiJdfQ==