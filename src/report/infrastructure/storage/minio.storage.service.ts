import { Injectable, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';
import { StoragePort } from 'src/attachment/domain/ports/storage.port';

@Injectable()
export class MinioStorageService implements OnModuleInit, StoragePort {
  private client: Minio.Client;
  private bucketName: string;

  async onModuleInit() {
    this.client = new Minio.Client({
      endPoint: process.env.MINIO_ENDPOINT || '',
      port: Number(process.env.MINIO_PORT) || 9000,
      useSSL: process.env.MINIO_USE_SSL === 'true',
      accessKey: process.env.MINIO_ACCESS_KEY || '',
      secretKey: process.env.MINIO_SECRET_KEY || '',
    });
    this.bucketName = process.env.MINIO_BUCKET_NAME || 'reports';

    await this.ensureBucketExists();
  }

  private async ensureBucketExists() {
    const exists = await this.client.bucketExists(this.bucketName);
    if (!exists) {
      await this.client.makeBucket(this.bucketName);
      await this.makeBucketWithPolicy();
    }
  }

  private async makeBucketWithPolicy() {
    const policy = {
      Version: '2012-10-17',
      Statement: [
        {
          Effect: 'Allow',
          Principal: '*',
          Action: ['s3:GetObject'],
          Resource: `arn:aws:s3:::${this.bucketName}/*`,
        },
      ],
    };
    await this.client.setBucketPolicy(this.bucketName, JSON.stringify(policy));
  }

  async upload(
    fileKey: string,
    buffer: Buffer,
    size: number,
    mimeType: string,
  ) {
    try {
      await this.client.putObject(this.bucketName, fileKey, buffer, size, {
        'Content-Type': mimeType,
      });

      return fileKey;
    } catch (error) {
      throw new Error(`Error in uploading ${error.message}`);
    }
  }

  async generatePresignedUrl(key: string, expiry: number = 3600) {
    try {
      return this.client.presignedGetObject(this.bucketName, key, expiry);
    } catch (error) {
      throw new Error(`Error in generating presigned url ${error.message}`);
    }
  }

  async deleteObject(key: string) {
    try {
      return await this.client.removeObject(this.bucketName, key);
    } catch (error) {
      throw new Error(`Error in deleting object ${error.message}`);
    }
  }
}
