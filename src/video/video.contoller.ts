import {
  Controller,
  FileTypeValidator,
  Get,
  Param,
  ParseFilePipe,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { VideoService } from './video.service';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import * as path from 'path';
import { Response } from 'express';
import { VideoUploadParams } from './types/video-upload.params';
import { FileDurationValidator } from 'src/common/file-duration.validation';

@Controller('video')
export class VideoController {
  constructor(private service: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', {
      storage: diskStorage({
        destination: 'uploads/temp',
        filename: (req, file, callback) => {
          const id = randomUUID();
          const extension = path.extname(file.originalname);

          callback(null, `${id}${extension}`);
        },
      }),
    }),
  )
  uploadFile(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new FileTypeValidator({ fileType: /video\/.*/ }),
          new FileDurationValidator({ maxDuration: 60 }),
        ],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @Query() params: VideoUploadParams,
  ) {
    return this.service.videoUploaded(file.filename, params);
  }

  @Get('download/:id')
  downloadVideo(@Param('id') id: string, @Res() res: Response) {
    return this.service.downloadVideo(id, res);
  }
}
