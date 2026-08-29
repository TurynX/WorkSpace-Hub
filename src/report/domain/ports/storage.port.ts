export abstract class StoragePort {
  abstract upload(
    fileKey: string,
    buffer: Buffer,
    size: number,
    mimeType: string,
  ): Promise<string>;

  abstract generatePresignedUrl(fileKey: string);

  abstract deleteObject(fileKey: string);
}
