import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { VideoController } from './video.contoller';
import { VideoService } from './video.service';
import { VideoProcessor } from './video.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'video',
    }),
  ],
  controllers: [VideoController],
  providers: [VideoService, VideoProcessor],
})
export class VideoModule {}
