import { AttachmentEntity } from '../entities/attachment.entity';

export abstract class AttachmentPort {
  abstract upload(
    taskId: string,
    fileKey: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<AttachmentEntity>;

  abstract getAll(taskId: string): Promise<AttachmentEntity[] | null>;

  abstract getById(attachmentId: string): Promise<AttachmentEntity | null>;

  abstract deleteAttachment(attachmentId: string): Promise<AttachmentEntity>;
}
