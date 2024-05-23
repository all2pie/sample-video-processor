import { InjectQueue } from '@nestjs/bull';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Queue } from 'bull';
import { Response } from 'express';
import { unlinkSync } from 'fs';
import * as path from 'path';
import { VideoUploadParams } from './types/video-upload.params';
import { VideoStatus, Videos } from './types/video.types';
import { VideoProcessor } from './video.processor';

const videos: Videos = {};

@Injectable()
export class VideoService {
  constructor(
    @InjectQueue('video') private videoQueue: Queue,
    videoProcessor: VideoProcessor,
  ) {
    videoProcessor.on('done', (id) => {
      const video = videos[id];
      video.status = VideoStatus.Done;
      const videoPath = path.resolve(`uploads/temp/${video.name}`);
      unlinkSync(videoPath);
    });
  }

  async videoUploaded(fileName: string, transforms: VideoUploadParams) {
    const id = fileName.split('.')[0];

    // 30 Minutes Expiry
    const expireAt = new Date();
    expireAt.setMinutes(expireAt.getMinutes() + 30);

    videos[id] = {
      id,
      name: fileName,
      status: VideoStatus.ToDo,
      expireAt,
      transforms,
    };

    await this.videoQueue.add(videos[id]);

    return {
      downloadUrl: `http://localhost:3000/video/download/${id}`,
    };
  }

  downloadVideo(id: string, res: Response) {
    const video = videos[id];

    if (!video) throw new NotFoundException('Video not found');

    if (video.status !== VideoStatus.Done) {
      return res.json({
        message: 'Please wait, Video is being processed',
      });
    }

    if (new Date() > video.expireAt)
      throw new BadRequestException('This link is expired');

    res.download(`uploads/videos/${video.name}`);
  }
}
