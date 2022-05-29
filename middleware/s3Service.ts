import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

const s3Uploadv2 = async (files: any) => {
	const s3 = new S3();

	const params = files.map((file: any) => {
		const randomName = crypto.randomBytes(16).toString("hex");
		const fileExtension = file.mimetype.split("/").pop();
		const filenameString = `${randomName}.${fileExtension}`;
		return {
			Bucket: process.env.AWS_BUCKET_NAME,
			Key: filenameString,
			Body: file.buffer,
			ACL: "public-read",
		};
	});

	return await Promise.all(
		params.map((param: any) => s3.upload(param).promise())
	);
};

export default s3Uploadv2;
