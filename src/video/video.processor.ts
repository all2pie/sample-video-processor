import { path as ffmpegPath } from '@ffmpeg-installer/ffmpeg';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import * as EventEmitter from 'events';
import * as ffmpeg from 'fluent-ffmpeg';
import { existsSync, mkdirSync } from 'fs';
import * as path from 'path';
import { VideoFilter } from './types/video-filters.types';
import { Video } from './types/video.types';

ffmpeg.setFfmpegPath(ffmpegPath);

const folder = 'uploads/videos';
if (!existsSync(folder)) {
  mkdirSync(folder, { recursive: true });
}

@Processor('video')
export class VideoProcessor extends EventEmitter {
  filters = {
    [VideoFilter.Grayscale]: { filter: 'hue', options: 's=0' },
    [VideoFilter.Negate]: { filter: 'negate', options: {} },
    [VideoFilter.Sepia]: {
      filter:
        'colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131',
      options: {},
    },
    [VideoFilter.Blur]: { filter: 'boxblur', options: '10:1' },
    [VideoFilter.Sharpen]: { filter: 'unsharp', options: '5:5:1.0:5:5:0.0' },
  };

  constructor() {
    super();
  }

  @Process()
  transformVideo(job: Job<Video>) {
    const video = job.data;
    const transforms = video.transforms || {};

    const outputFileName = transforms.format
      ? `${video.id}.${transforms.format}`
      : video.name;
    const inputPath = path.resolve(`uploads/temp/${video.name}`);
    const outputPath = path.resolve(`${folder}/${outputFileName}`);

    let cmd = ffmpeg(inputPath)
      .on('start', (commandLine) => {
        console.log('Spawned Ffmpeg with command: ' + commandLine);
      })
      .on('error', (err) => {
        console.log('An error occurred: ' + err.message);
      })
      .on('progress', (progress) => {
        // This check is to handle this issue: https://github.com/fluent-ffmpeg/node-fluent-ffmpeg/issues/1201
        if (progress.percent) {
          this.emit('progress', progress.percent);
          console.log('Processing: ' + progress.percent + '% done');
        } else {
          this.emit('progress', progress);
          console.log('Progress', JSON.stringify(progress, null, 2));
        }
      })
      .on('end', () => {
        console.log('Processing finished!');
        this.emit('done', video.id);
      });

    if (transforms.filter) {
      cmd = cmd.videoFilter([this.filters[transforms.filter]]);
    }

    if (transforms.height || transforms.width) {
      const height = transforms.height || '?';
      const width = transforms.width || '?';
      cmd = cmd.size(`${width}x${height}`);
    }

    // if (transforms.format) {
    //   cmd = cmd.format(transforms.format);
    // }

    if (transforms.description) {
      cmd = cmd.outputOption('-metadata', `comment=${transforms.description}`);
    }

    if (transforms.title) {
      cmd = cmd.outputOption('-metadata', `title=${transforms.title}`);
    }

    cmd.save(outputPath);
  }
}
