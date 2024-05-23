import { VideoUploadParams } from './video-upload.params';

export enum VideoStatus {
  ToDo = 'ToDo',
  InProgress = 'InProgress',
  Done = 'Done',
}

export type Video = {
  id: string;
  name: string;
  expireAt: Date;
  status: VideoStatus;
  transforms: VideoUploadParams;
};

export type Videos = {
  [id: string]: Video;
};
