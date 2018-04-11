import {Component, OnInit} from '@angular/core';
import 'rxjs/operators/map';

import {AppService} from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  spinner = false;
  errorMsg: string;
  duration: number;
  selectedFile = null;
  selectedFileName: string;
  videoUploadedSuccessful = false;
  uploadedVideo: any;
  fieldError = { type: '', message: '' };
  timing = {
    from: { type: 'sec', value: null },
    duration: { type: 'sec', value: null }
  };

  constructor(private appService: AppService) {}

  ngOnInit() {}

  getVideoTiming(type) {
    switch (type) {
      case 'sec':
        return Math.floor(this.duration);
      case 'min':
        return Math.floor(this.duration / 60);
    }
  }

  onFileSelected(event) {
    this.selectedFile = event.target.files[0];
    this.selectedFileName = this.selectedFile.name;

    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      this.duration = video.duration;
    };

    const selectedVID = event.target.files[0];
    video.src = URL.createObjectURL(selectedVID);
  }

  onUploadFile() {
    const validation = this.appService.validate(this.duration, this.timing);
    if (validation.type === 'valid') {
      this.spinner = true;
      this.appService.upload(this.selectedFile, this.timing)
        .subscribe(
        data => {
          this.uploadedVideo = data;
          this.videoUploadedSuccessful = true;
          this.spinner = false;
        },
        error => {
          this.errorMsg = error.message;
          console.error('failed to upload', error);
        }
      );
    } else {
      this.fieldError = validation;
    }
  }

  onDownload() {
    this.spinner = true;
    this.appService.download({
      filename: this.uploadedVideo.file.filename,
      mime: this.uploadedVideo.file.contentType}, this.timing)
      .subscribe((data) => {
          this.appService.downloadFile(data, this.uploadedVideo.file.contentType , this.uploadedVideo.file.filename);
      },
      error => {
        this.spinner = false;
        this.errorMsg = error.message;
        console.log('failed to download', error);
      },
      () => {
        this.spinner = false;
        console.log('done');
      });
  }

  onRestart() {
    this.uploadedVideo = {};
    this.videoUploadedSuccessful = false;
    this.errorMsg = '';
  }
}
