import { WorkerHost, Processor } from '@nestjs/bullmq';

import { Job } from 'bullmq';
import { StoragePort } from 'src/attachment/domain/ports/storage.port';

@Processor('attachment-queue')
export class AttachmentWorker extends WorkerHost {
  constructor(private readonly storagePort: StoragePort) {
    super();
  }
  async process(job: Job) {
    console.log('Processing job');
    switch (job.name) {
      case 'upload-attachment': {
        try {
          const { fileKey, buffer, size, mimetype } = job.data;

          const fileBuffer =
            typeof buffer === 'string'
              ? Buffer.from(buffer, 'base64')
              : Buffer.from(buffer);
          console.log(fileKey, size, mimetype);
          const upload = await this.storagePort.upload(
            fileKey,

            fileBuffer,
            size,
            mimetype,
          );

          return { success: true, fileKey: upload };
        } catch (error) {
          throw new Error(`Error in uploading ${error.message}`);
        }
      }

      case 'delete-attachment': {
        try {
          const fileKey = job.data;
          await this.storagePort.deleteObject(fileKey);
          return { success: true };
        } catch (error) {
          throw new Error(`Error in deleting object ${error.message}`);
        }
      }
      default:
        throw new Error('Invalid job name ' + job.name);
    }
  }
}
