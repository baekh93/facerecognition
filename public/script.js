// import faceapi from 'face-api.js'
// const faceapi = require("face-api.js"
// import tf from '@tensorflow/tfjs'
// const video = document.getElementById("video");
// const inputImg = $('#inputImg').get(0)
// const canvas = $('#overlay').get(0)

var iCropLeft, iCropTop, iCropWidth, iCropHeight;

    Promise.all([
        // faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        // faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        // faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.mtcnn.load("/models"),
    ]).then();

    async function loadImageFromUrl(url) {
        const img = await requestExternalImage($('#imgUrlInput').val())
        $('#inputImg').get(0).src = img.src
        startImg()

    }

//파일업로드시 실행되는 함
    async function loadImageFromUpload() {
        const imgFile = $('#queryImgUploadInput').get(0).files[0]
        const img = await faceapi.bufferToImage(imgFile)
        $('#inputImg').get(0).src = img.src
        startImg()
    }

    async function requestExternalImage(imageUrl) {
        const res = await fetch('fetch_external_image', {
            method: 'post',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({imageUrl})
        })
        if (!(res.status < 400)) {
            console.error(res.status + ' : ' + await res.text())
            throw new Error('failed to fetch image from url: ' + imageUrl)
        }

        let blob
        try {
            blob = await res.blob()
            return await faceapi.bufferToImage(blob)
        } catch (e) {
            console.error('received blob:', blob)
            console.error('error:', e)
            throw new Error('failed to load image from url: ' + imageUrl)
        }
    }

    async function startImg() {
        // const model = await tf.loadLayersModel("/models/male_model.json");
        const inputImg = $('#inputImg').get(0)
        const canvas = $('#overlay').get(0)
        const option = new faceapi.MtcnnOptions({minFaceSize: 20})
        const displaySize = {width: inputImg.width, height: inputImg.height};
        const detections = await faceapi.detectAllFaces(inputImg, option);
        // const example = tf.fromPixels(inputImg);  // for example
        // const prediction = model.predict(example);
        debugger
    /*    const box = detections[0].box;
        const img = new Image();
        img.onload = function(){
            var cropCanvas = document.getElementById("canvas_crop");
            cropCanvas.width = iCropWidth;
            cropCanvas.height = iCropHeight;
            var ctx = cropCanvas.getContext("2d");
            ctx.drawImage( img, box.left, box.top, box.width, box.height, 0, 0, box.width, box.height );
        };
        img.src = inputImg.toDataURL();*/
        faceapi.matchDimensions(canvas, inputImg)
        const resizedResults = faceapi.resizeResults(detections, inputImg)
        // const resizedDetections = faceapi.resizeResults(detections, displaySize);
        // canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedResults);
    }

function CropImage()
{
    var canvas = document.getElementById("canvas");

    img = new Image();
    img.onload = function(){
        var cropCanvas = document.getElementById("canvas_crop");
        cropCanvas.width = iCropWidth;
        cropCanvas.height = iCropHeight;
        var ctx = cropCanvas.getContext("2d");
        ctx.drawImage( img, iCropLeft, iCropTop, iCropWidth, iCropHeight, 0, 0, iCropWidth, iCropHeight );
    };

    img.src = canvas.toDataURL();
}

    function startVideo() {
        navigator.mediaDevices
            .getUserMedia({video: true})
            .then(function (stream) {
                video.srcObject = stream;
            })
            .catch(function (err) {
                console.log(err);
            });
    }


/*

video.addEventListener("playing", () => {
    const canvas = faceapi.createCanvasFromMedia(video);
    document.body.append(canvas);
    const displaySize = { width: video.width, height: video.height };
    faceapi.matchDimensions(canvas, displaySize);
    setInterval(async () => {
        // const detections = await faceapi
        //     .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        //     .withFaceLandmarks()
        //     .withFaceExpressions();

        const detections = await faceapi
            .detectAllFaces(video, new faceapi.MtcnnOptions({ minFaceSize: 20}))

        const resizedDetections = faceapi.resizeResults(detections, displaySize);
        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
        faceapi.draw.drawDetections(canvas, resizedDetections);
        // faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        // faceapi.draw.(canvas, resizedDetections);
    }, 100);


});
*/
