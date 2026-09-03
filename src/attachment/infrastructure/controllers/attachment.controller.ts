import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  InternalServerErrorException,
  MaxFileSizeValidator,
  Param,
  ParseFilePipe,
  Post,
  Req,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DeleteAttachmentUseCase } from 'src/attachment/application/use-cases/delete-attachment.use-case';
import { DownloadAttachmentUseCase } from 'src/attachment/application/use-cases/dowload-attachment.use-case';
import { GetAllAttachmentsUseCase } from 'src/attachment/application/use-cases/get-all-attachments.use-case';
import { UploadAttachmentUseCase } from 'src/attachment/application/use-cases/upload-attachment.use.case';
import { AuthGuard } from 'src/auth/application/guards/auth.guard';

@UseGuards(AuthGuard)
@Controller()
export class AttachmentController {
  constructor(
    private readonly uploadAttachmentUseCase: UploadAttachmentUseCase,
    private readonly getAllAttachmentsUseCase: GetAllAttachmentsUseCase,
    private readonly downloadAttachmentUseCase: DownloadAttachmentUseCase,
    private readonly deleteAttachmentUseCase: DeleteAttachmentUseCase,
  ) {}
  @Post('/task/:taskId/attachment/upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Req() req: Request,
    @Param('taskId') taskId: string,
    @UploadedFile(
      new ParseFilePipe({
        errorHttpStatusCode: HttpStatus.PAYLOAD_TOO_LARGE,
        validators: [new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 })],
      }),
    )
    file: Express.Multer.File,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');
    const attachment = await this.uploadAttachmentUseCase.execute(
      taskId,
      file,
      userId,
    );
    return { data: attachment };
  }
  @Get('/task/:taskId/attachments')
  async getAll(@Req() req: Request, @Param('taskId') taskId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');
    const attachments = await this.getAllAttachmentsUseCase.execute(
      taskId,
      userId,
    );

    return { data: attachments };
  }

  @Get('/attachment/:attachmentId/download')
  async get(@Req() req: Request, @Param('attachmentId') attachmentId: string) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');
    const url = await this.downloadAttachmentUseCase.execute(
      attachmentId,
      userId,
    );
    if (!url) throw new InternalServerErrorException('Failed to generate url');
    return { data: { url } };
  }
  @Delete('/attachment/:attachmentId/delete')
  async delete(
    @Req() req: Request,
    @Param('attachmentId') attachmentId: string,
  ) {
    const userId = req['user'].sub;
    if (!userId) throw new UnauthorizedException('No userId provided');
    const attachment = await this.deleteAttachmentUseCase.execute(
      attachmentId,
      userId,
    );
    return { data: attachment };
  }
}
