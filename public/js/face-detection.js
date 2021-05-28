// const canvas = require('canvas')
// import  * as canvas from 'canvas'

let maleModel, ssdModel = undefined;

Promise.all([
    // faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
    // faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
    // faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
    faceapi.nets.mtcnn.load("/models"),
    tf.loadGraphModel("/maleModel/model.json"),
]).then(function (e) {
    debugger
    maleModel = e[1];
});

const resStr = ["못생김", "잘생김"]
var clsImage;
var iCropLeft, iCropTop, iCropWidth, iCropHeight;

let fac_width, fac_height;

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
    clsFileReader.onload = function (e) {
        clsImage = new Image();
        clsImage.onload = async function () {
            var canvas = document.getElementById("canvas");
            // canvas.width = clsImage.width;
            // canvas.height = clsImage.height;
            await getFactorImg(clsImage.width,clsImage.height)

            canvas.width = fac_width
            canvas.height =fac_height

            let inputIMG = $('#inputImg').get(0);

            var ctx = canvas.getContext("2d");
            ctx.drawImage(inputIMG, 0, 0, inputIMG.width, inputIMG.height, 0, 0, fac_width, fac_height);
            debugger

            // const ctx = canvas.getContext("2d");
            // const dt = ctx.getImageData(0,0,canvas.width,canvas.height);

            // const option = new faceapi.MtcnnOptions({maxNumScales: 5});

            const inpimage = document.getElementById("canvas").getContext("3d");

            // const detInput = tf.browser.fromPixels(canvas);
            // debugger
            // const rst = await detModel.predict(detInput);

            const option = new faceapi.MtcnnOptions({});
            const detections = await faceapi.detectAllFaces(canvas, option);

            // const rst = detModel.predict(detInput);
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
            await CropImage();
        /*    img = new Image();
            img.onload = function () {
                var canvas1 = document.getElementById("canvas_crop");

                var ctx = canvas1.getContext("2d");
                ctx.drawImage(img, 0, 0, canvas1.width,  canvas1.height, 0, 0,  canvas1.width,  canvas1.height);
            };*/

            // $("#inputImg").hide()
            // $("#canvas").hide()
            // AddCropMoveEvent();
        };

        clsImage.src = clsFileReader.result;
    };
    clsFileReader.readAsDataURL(inputFile.files[0]);

}

function getFactorImg(width, height) {
    let factor = undefined;
    if (width >height) {
        factor = 800/width;

    }else {
        factor= 800/height
    }

     fac_width = clsImage.width*factor;
    fac_height =clsImage.height*factor;
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

    // ctx.drawImage(clsImage, 0, 0);
    ctx.drawImage(canvas, 0, 0);
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
        ctx.drawImage(img, iCropLeft, iCropTop, iCropWidth, iCropHeight, 0, 0, iCropWidth, iCropHeight);

        var cc = document.getElementById("canvas_crop");
        var new_img = document.getElementById("testImg");
        var ctx = cc.getContext("2d");
        ctx.drawImage(new_img, 0, 0, cc.width, cc.height, 0, 0, cc.width, cc.height);
        new_img.src = cc.toDataURL();
    };
    // const maleModel = await tf.serialization.registerClass();

    const resizeImg = await tf.image.resizeBilinear(tf.browser.fromPixels(canvas), [224, 224]).div(tf.scalar(255));
    // const normImg = resizeImg / 255.
    const inputTensor = tf.expandDims(resizeImg);
    const pred = maleModel.predict(inputTensor);
    const score = pred.dataSync()
    const resultIndex = resStr[pred.as1D().argMax().dataSync()[0]]
    toast.toast("success", resultIndex, "center")


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
