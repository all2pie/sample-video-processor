import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { VideoFilter } from './video-filters.types';

export class VideoUploadParams {
  @IsOptional()
  @IsNumber()
  height?: number;

  @IsOptional()
  @IsString()
  width?: number;

  @IsOptional()
  @IsEnum(VideoFilter)
  filter?: VideoFilter;

  @IsOptional()
  @IsString()
  format?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;
}
