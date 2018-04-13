# VideoTrimApp

## Development server

First run the Mongo server, then you can start dev server by npm start command. Navigate to `http://localhost:4200/`.

## API
### Upload Video
```
/upload - upload video to MongoDB

INPUT PARAMS: 
file - multipart

OUTPUT:
object 

OUTPUT EXAMPLE:
{"_id":"5acb4729cb6c621a1c329fe6","length":5510872,"chunkSize":261120,"uploadDate":"2018-04-09T10:57:49.379Z","md5":"f13004eed4251c602bbe15737e8a1ecb","filename":"282034be97d0bdc9adb4608f4d1e7e38.mp4","contentType":"video/mp4"}
```
### Download Video
```
/download - download cutted video

INPUT PARAMS:
filename - string (from upload response)
from - number (trim start)
duration - number (cutted video duration)

OUTPUT:
blob
```
