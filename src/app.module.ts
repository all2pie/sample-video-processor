import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { BullModule } from '@nestjs/bull';
import { VideoModule } from './video/video.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    VideoModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
