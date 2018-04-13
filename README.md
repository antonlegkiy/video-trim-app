# VideoTrimApp

## Development server

First run the Mongo server, then you can start dev server by npm start command. Navigate to `http://localhost:4200/`.

## API

/upload - upload video to MongoDB

input params: 
file - multipart

output:
object 

output example:
{"_id":"5acb4729cb6c621a1c329fe6","length":5510872,"chunkSize":261120,"uploadDate":"2018-04-09T10:57:49.379Z","md5":"f13004eed4251c602bbe15737e8a1ecb","filename":"282034be97d0bdc9adb4608f4d1e7e38.mp4","contentType":"video/mp4"}


/download - download cutted video

input params:
filename - string (from upload response)
from - number (trim start)
duration - number (cutted video duration)

output:
blob
