export class AttachmentEntity {
  constructor(
    public readonly id: string,
    public readonly fileName: string,
    public readonly fileKey: string,
    public readonly mimeType: string,
    public readonly fileSize: number,
    public readonly createdAt: Date,
    public readonly taskId: string,
  ) {}
}
