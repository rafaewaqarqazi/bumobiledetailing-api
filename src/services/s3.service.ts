import { PutObjectCommand, S3 } from '@aws-sdk/client-s3';
import fs from 'fs';
import winston from 'winston';
// config
import { config } from '../config';
export default class S3Util {
  private bucket: string;
  private s3: S3;
  constructor(spacesSecret?: string, spacesKey?: string, bucket?: string) {
    this.bucket = bucket || config.bucket;
    this.s3 = new S3({
      endpoint: 'https://nyc3.digitaloceanspaces.com',
      region: 'us-east-1',
      credentials: {
        accessKeyId: config.spacesKey,
        secretAccessKey: config.spacesSecret,
      },
    });
  }

  public uploadToS3(
    fileName: string,
    filePath: string,
    type: string,
    acl?: boolean,
  ): Promise<string> {
    return new Promise(async (resolve, reject) => {
      try {
        const stream = fs.readFileSync(filePath);
        const innerFolder = type.split('/')[0];
        const filesUploaded: any = await this.s3.send(
          new PutObjectCommand({
            Bucket: this.bucket,
            Key: `bumd/${innerFolder}/${fileName}`,
            Body: stream,
            ContentType: type,
            ACL: acl ? 'private' : 'public-read',
          }),
        );

        winston.log(
          'info',
          `File has been successfully uploaded, ${filesUploaded.ETag}`,
        );
        return resolve(filesUploaded);
      } catch (err) {
        winston.log('error', err);
        return reject(err);
      }
    });
  }
}
