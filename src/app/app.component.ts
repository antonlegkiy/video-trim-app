import {Component, OnInit} from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import 'rxjs/operators/map';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  duration: number;
  selectedFile = null;
  selectedFileName: string;
  timing = {
    from: { type: 'sec', value: null },
    duration: { type: 'sec', value: null }
  };

  constructor(private http: HttpClient) {}

  ngOnInit() {}

  getVideoTiming(type) {
    switch (type) {
      case 'sec':
        return this.duration;
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
    const formData: FormData = new FormData();
    formData.append('file', this.selectedFile, this.selectedFile.name);

    const params = new HttpParams()
      .append('from', this.timing.from.type === 'min' ? this.timing.from.value * 60 : this.timing.from.value)
      .append('duration', this.timing.duration.type === 'min' ? this.timing.duration.value * 60 : this.timing.duration.value);
    const options = { params: params };

    this.http.post(`/upload`, formData, options)
      .subscribe(
        data => {
          console.log(data);
        },
        error => {
          alert('failed to upload');
        }
      );
  }
}
