const express = require('express');

const app = express();
const PORT = process.env.PORT = 9000;

//public 폴더 안에 있는 파일들을 static file 로 인식하게 한다.
app.use(express.static('public'));

app.listen(PORT, () => {
    console.log('Server is running at:',PORT);
});

