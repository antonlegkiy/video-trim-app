import {Component, OnInit} from '@angular/core';
import 'rxjs/operators/map';

import {AppService} from './app.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
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
      this.appService.upload(this.selectedFile, this.timing)
        .subscribe(
        data => {
          console.log(data);
          this.uploadedVideo = data;
          this.videoUploadedSuccessful = true;
        },
        error => {
          alert('failed to upload');
        }
      );
    } else {
      this.fieldError = validation;
    }
  }

  onDownload() {
    this.appService.download({
      filename: this.uploadedVideo.file.filename,
      mime: this.uploadedVideo.file.contentType}, this.timing);
  }

  onRestart() {
    this.uploadedVideo = {};
    this.videoUploadedSuccessful = false;
  }
}
