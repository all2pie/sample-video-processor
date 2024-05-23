import { FileValidator, Injectable } from '@nestjs/common';
import { getVideoDurationInSeconds } from 'get-video-duration';

type FileDurationValidatorOptions = {
  maxDuration: number;
};

@Injectable()
export class FileDurationValidator extends FileValidator<FileDurationValidatorOptions> {
  async isValid(file): Promise<boolean> {
    if (!this.validationOptions) {
      return true;
    }

    const duration = await getVideoDurationInSeconds(file.path);

    return duration <= this.validationOptions.maxDuration;
  }

  buildErrorMessage(): string {
    return `Validation failed (duration should be less then or equal to ${this.validationOptions.maxDuration} seconds)`;
  }
}
