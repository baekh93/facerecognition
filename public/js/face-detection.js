// const canvas = require('canvas')
// import  * as canvas from 'canvas'

let maleModel = undefined;

Promise.all([
    // faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    // faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    // faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.mtcnn.load("/models"),
    tf.loadGraphModel("/maleModel/model.json")
]).then(function (e) {
    maleModel = e[1];
});

const resStr = ["못생김", "잘생김"]
var clsImage;
var iCropLeft, iCropTop, iCropWidth, iCropHeight;

// 로컬 이미지 파일을 Canvas 에 로드한다.
async function LoadImage() {
    if (typeof window.FileReader !== 'function') {
        alert("FileReader is not supported");
        return;
    }
    const imgFile = $('#image_file').get(0).files[0]
    const img = await faceapi.bufferToImage(imgFile)

    // var dd = await faceapi.createCanvas(img);
    // var a = faceapi.createCanvasFromMedia(dd);
    debugger
    // scaleFactor = 500 / img.width;

    $('#inputImg').get(0).src = img.src

    var inputFile = document.getElementById('image_file');
    var clsFileReader = new FileReader();
    clsFileReader.onload = function () {
        clsImage = new Image();
        clsImage.onload = async function () {
            var canvas = document.getElementById("canvas");

            canvas.width = clsImage.width;
            canvas.height = clsImage.height;
            let inputIMG = $('#inputImg').get(0);

            // const ctx = canvas.getContext("2d");
            // const dt = ctx.getImageData(0,0,canvas.width,canvas.height);

            // const option = new faceapi.MtcnnOptions({maxNumScales: 5});

            const inpimage = document.getElementById("canvas").getContext("3d");
            const option = new faceapi.MtcnnOptions({});
            const detections = await faceapi.detectAllFaces(inputIMG, option);
            debugger
            if (detections.length === 0) {
                toast.toast("error", "사진에서 얼굴을 인식하지 못했습니다. 다른 이미지를 사용해주세요", "top")
            } else {
                const box = detections[0].box;
                iCropLeft = box.left;
                iCropTop = box.top;
                iCropWidth = box.width;
                iCropHeight = box.height;
                iImageWidth = clsImage.width;
                iImageHeight = clsImage.height;
            }

            /*  iCropLeft = 100;
              iCropTop = 100;
              iCropWidth = clsImage.width - 200;
              iCropHeight = clsImage.height - 200;
              iImageWidth = clsImage.width;
              iImageHeight = clsImage.height;*/

            DrawCropRect();
            await CropImage()
            // $("#inputImg").hide()
            // $("#canvas").hide()
            // AddCropMoveEvent();
        };

        clsImage.src = clsFileReader.result;
    };
    clsFileReader.readAsDataURL(inputFile.files[0]);

}

/*function canvas2PNGImage(canvas : HTMLCanvasElement) : HTMLImageElement {
    var document = dom.window.document;
    var image = document.createElement("img");
    image.src = canvas.toDataURL();
    return image;
}*/

// 로컬 이미지 파일과 Crop 을 위한 사각형 박스를 그려준다.
function DrawCropRect() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");

    ctx.drawImage(clsImage, 0, 0);

    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.rect(iCropLeft, iCropTop, iCropWidth, iCropHeight);
    ctx.stroke();
}

// 이미지를 crop 하여서 하단 Canvas 에 그려준다.
async function CropImage() {
    var canvas = document.getElementById("canvas");

    img = new Image();
    img.onload = function () {
        var canvas = document.getElementById("canvas_crop");
        canvas.width = iCropWidth;
        canvas.height = iCropHeight;
        var ctx = canvas.getContext("2d");
        debugger
        ctx.drawImage(img, iCropLeft, iCropTop, iCropWidth, iCropHeight, 0, 0, iCropWidth, iCropHeight);
    };
    // const maleModel = await tf.serialization.registerClass();

    const resizeImg = await tf.image.resizeBilinear(tf.browser.fromPixels(canvas), [224, 224]).div(tf.scalar(255));
    // const normImg = resizeImg / 255.
    debugger
    const inputTensor = tf.expandDims(resizeImg);
    const pred = maleModel.predict(inputTensor);
    const score = pred.dataSync()
    const resultIndex = resStr[pred.as1D().argMax().dataSync()[0]]
    toast.toast("success", resultIndex, "center")


    debugger
    img.src = canvas.toDataURL();
}

// 마우스 이동에 따른 Crop 사각 박스을 이동하기 위한 이벤트 핸들러를 등록한다.
function AddCropMoveEvent() {
    var canvas = document.getElementById("canvas");
    var bDrag = false;
    var iOldX, iOldY;
    var iCropLeftOld, iCropTopOld;

    canvas.onmousedown = function (e) {
        bDrag = true;
        iOldX = e.clientX;
        iOldY = e.clientY;
        iCropLeftOld = iCropLeft;
        iCropTopOld = iCropTop;
    };

    canvas.onmousemove = function (e) {
        if (bDrag == false) return;

        var iX = e.clientX - iOldX;
        var iY = e.clientY - iOldY;

        iCropLeft = iCropLeftOld + iX;
        if (iCropLeft < 0) {
            iCropLeft = 0;
        } else if (iCropLeft + iCropWidth > clsImage.width) {
            iCropLeft = clsImage.width - iCropWidth;
        }

        iCropTop = iCropTopOld + iY;
        if (iCropTop < 0) {
            iCropTop = 0;
        } else if (iCropTop + iCropHeight > clsImage.height) {
            iCropTop = clsImage.height - iCropHeight;
        }

        DrawCropRect();
    };

    canvas.onmouseup = function (e) {
        bDrag = false;
    };
}
