# Video Processor

I have used Nestjs framework, Multer fro handling file upload, Bull for queue, fluent-ffmpeg processing videos, class-validator for validations and @ffmpeg-installer/ffmpeg for handling cross platform installation of ffmpeg.

## Setup

* Run `npm i`
* Run `docker-compose up -d` - skip this if there is a redis instance running at port 6379

## Usage

* Run `npm start`
* Do a POST request at <http://localhost:3000/video/upload> with form-data body having field name as 'video' and value as the video file

## Architecture Decisions

* I personally use pnpm instead of npm but it is usually not installed on everyone's system so for ease I went with npm
* I would use separate processes for the video processor
* I would store videos meta data in persistent redis storage
* I would do the file validations before upload
