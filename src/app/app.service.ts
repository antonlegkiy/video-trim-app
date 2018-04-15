import {HttpClient, HttpParams} from '@angular/common/http';
import {Injectable} from '@angular/core';
import * as FileSaver from 'file-saver';

@Injectable()
export class AppService {
  errors = {
    fromError: 'Value in "from" field is greater than video duration',
    durationError: 'Value in "duration" field is greater than video duration',
    emptyValue: 'Fields "from" and "duration" are required'
  };
  constructor(private http: HttpClient) {}

  downloadFile(data, mime, name) {
    const blob = new Blob([data], { type: mime });
    FileSaver.saveAs(blob, name);
  }

  upload(file, timing) {
    const formData: FormData = new FormData();
    formData.append('file', file, file.name);

    return this.http.post(`/upload`, formData);
  }

  download(file, timing) {
    const params = new HttpParams()
      .append('filename', file.filename)
      .append('from', timing.from.type === 'min' ? timing.from.value * 60 : timing.from.value)
      .append('duration', timing.duration.type === 'min' ? timing.duration.value * 60 : timing.duration.value);

    return this.http.get(`/download`, { responseType: 'blob', params: params });
  }

  getToken() {
    return this.http.get(`/token`);
  }

  verifyExtension (sFileNameForCheck) {
    const aAvailableFileExtensions = ['mp4', 'avi', 'mkv', 'm4p ', 'm4v', 'webm', 'flv', 'mov', 'qt', 'wmv', 'mpg', 'mpeg', '3gp'];

    for (let i = 0; i < aAvailableFileExtensions.length; i++) {
      if (sFileNameForCheck.type.indexOf(aAvailableFileExtensions[i]) > -1) {
        return true;
      }
    }
    return false;
  }

  validate(duration, timing, file) {
    const errorMsg = { message: '', type: '' };
    const fromVal = timing.from.value;
    const durVal = timing.duration.value;

    if (fromVal != null && durVal != null) {
      if (timing.from.type === 'sec' && timing.duration.type === 'sec') {
        if (fromVal >= duration) {
          errorMsg.type = 'from';
          errorMsg.message = this.errors.fromError;
        } else if (durVal >= duration || fromVal + durVal >= duration) {
          errorMsg.type = 'duration';
          errorMsg.message = this.errors.durationError;
        }
      } else if (timing.from.type === 'min' && timing.duration.type === 'sec') {
        if (fromVal * 60 >= duration) {
          errorMsg.type = 'from';
          errorMsg.message = this.errors.fromError;
        } else if (durVal >= duration || durVal + fromVal * 60 >= duration) {
          errorMsg.type = 'duration';
          errorMsg.message = this.errors.durationError;
        }
      } else if (timing.from.type === 'min' && timing.duration.type === 'min') {
        if (fromVal * 60 >= duration) {
          errorMsg.type = 'from';
          errorMsg.message = this.errors.fromError;
        } else if (durVal * 60 >= duration || durVal * 60 + fromVal * 60 >= duration) {
          errorMsg.type = 'duration';
          errorMsg.message = this.errors.durationError;
        }
      } else if (timing.from.type === 'sec' && timing.duration.type === 'min') {
        if (fromVal >= duration) {
          errorMsg.type = 'from';
          errorMsg.message = this.errors.fromError;
        } else if (durVal * 60 >= duration || durVal * 60 + fromVal >= duration) {
          errorMsg.type = 'duration';
          errorMsg.message = this.errors.durationError;
        }
      }
    } else {
      errorMsg.type = 'empty';
      errorMsg.message = this.errors.emptyValue;
    }

    errorMsg.type = errorMsg.type ? errorMsg.type : 'valid';
    errorMsg.message = errorMsg.message ? errorMsg.message : '';

    return errorMsg;
  }
}
