import { Injectable } from '@nestjs/common';
import { AttachmentEntity } from 'src/attachment/domain/entities/attachment.entity';
import { AttachmentPort } from 'src/attachment/domain/ports/attachment.port';
import { PrismaService } from 'src/lib/prisma/prisma.service';

@Injectable()
export class AttachmentRepository implements AttachmentPort {
  constructor(private readonly prisma: PrismaService) {}

  async upload(
    taskId: string,
    fileKey: string,
    fileName: string,
    mimeType: string,
    fileSize: number,
  ): Promise<AttachmentEntity> {
    const attachment = await this.prisma.attachment.create({
      data: {
        taskId,
        fileKey,
        fileName,
        mimeType,
        fileSize,
      },
    });
    return new AttachmentEntity(
      attachment.id,
      attachment.fileName,
      attachment.fileKey,
      attachment.mimeType,
      attachment.fileSize,
      attachment.createdAt,
      attachment.taskId,
    );
  }

  async getAll(taskId: string): Promise<AttachmentEntity[] | null> {
    const attachment = await this.prisma.attachment.findMany({
      where: {
        taskId,
      },
    });

    if (!attachment) return null;

    return attachment.map(
      (attachment) =>
        new AttachmentEntity(
          attachment.id,
          attachment.fileName,
          attachment.fileKey,
          attachment.mimeType,
          attachment.fileSize,
          attachment.createdAt,
          attachment.taskId,
        ),
    );
  }

  async getById(attachmentId: string): Promise<AttachmentEntity | null> {
    const attachment = await this.prisma.attachment.findUnique({
      where: {
        id: attachmentId,
      },
    });
    if (!attachment) return null;
    return new AttachmentEntity(
      attachment.id,
      attachment.fileName,
      attachment.fileKey,
      attachment.mimeType,
      attachment.fileSize,
      attachment.createdAt,
      attachment.taskId,
    );
  }

  async deleteAttachment(attachmentId: string): Promise<AttachmentEntity> {
    const attachment = await this.prisma.attachment.delete({
      where: {
        id: attachmentId,
      },
    });

    return new AttachmentEntity(
      attachment.id,
      attachment.fileName,
      attachment.fileKey,
      attachment.mimeType,
      attachment.fileSize,
      attachment.createdAt,
      attachment.taskId,
    );
  }
}
