let maleModel, ssdModel = undefined;

const resStr = ["못생김", "잘생김"]
var clsImage;
var iCropLeft, iCropTop, iCropWidth, iCropHeight;

let fac_width, fac_height;
var clsImage;
let resultSet = [
    {
        name: undefined,
        score: undefined,
        result: undefined,
        onLoad: false
    },
    {
        name: undefined,
        score: undefined,
        result: undefined,
        onLoad: false
    }
]
let resVal= undefined;


Promise.all([
    faceapi.nets.mtcnn.load("/models"),
    tf.loadGraphModel("/maleModel/model.json"),
]).then(function (e) {
    maleModel = e[1];
});

async function readURL(input) {
    const $divElement = $(input).closest(".person-div");
    if ($divElement[0].id === "person1") {
        resVal = 0;
    }else if ($divElement[0].id === "person2") {
        resVal = 1;
    }
    //이름입력 로직
    resultSet[resVal].name = $divElement[0].id;
    if (input.files && input.files[0]) {
        const imgFile = $(input).get(0).files[0]
        const img = await faceapi.bufferToImage(imgFile)
        // const $divElement = $(input).closest(".person-div");
        $divElement.find(".file-upload-image").get(0).src = img.src;

        var clsFileReader = new FileReader();


        $divElement.find('.image-upload-wrap').hide();
        $divElement.find('.file-upload-content').show();
        $divElement.find('.image-title').html(input.files[0].name)
        clsFileReader.onload = function (e) {

            // $('.file-upload-image').attr('src', e.target.result);
            // $('.file-upload-content').show();
            //
            // $('.image-title').html(input.files[0].name);
            clsImage = new Image();
            clsImage.onload = async function () {
                var canvas = $divElement.find(".res-canvas").get(0);
                var crop_canvas = $divElement.find(".crop-canvas").get(0);

                getFactorImg(clsImage.width, clsImage.height);
                canvas.width = fac_width
                canvas.height = fac_height
                let inputIMG = $divElement.find('.file-upload-image').get(0);
                var ctx = canvas.getContext("2d");
                ctx.drawImage(inputIMG, 0, 0, inputIMG.naturalWidth, inputIMG.naturalHeight, 0, 0, fac_width, fac_height);
                const option = new faceapi.MtcnnOptions({});
                const detections = await faceapi.detectAllFaces(canvas, option);

                if (detections.length === 0) {
                    toast.toast("error", "사진에서 얼굴을 인식하지 못했습니다. 다른 이미지를 사용해주세요", "top")
                } else {
                    const box = detections[0].box;
                    iCropLeft = box.left;
                    iCropTop = box.top;
                    iCropWidth = box.width;
                    iCropHeight = box.height;
                    // iImageWidth = clsImage.width;
                    // iImageHeight = clsImage.height;
                }
                DrawCropRect(canvas);
                await CropImage($divElement, canvas, crop_canvas);
            }
            clsImage.src = clsFileReader.result
        };

        clsFileReader.readAsDataURL(input.files[0]);

    } else {
        removeUpload();
    }
}

function getFactorImg(width, height) {
    let factor = undefined;
    if (width <= 300 && height <= 300) {
        fac_height = height
        fac_width = width
    } else {
        if (width > height) {
            factor = 300 / width;
        } else {
            factor = 300 / height
        }
        fac_width = clsImage.width * factor;
        fac_height = clsImage.height * factor;
    }
}

function DrawCropRect(canvas) {
    // var canvas = document.getElementById("canvas");

    var ctx = canvas.getContext("2d");

    // ctx.drawImage(clsImage, 0, 0);
    ctx.drawImage(canvas, 0, 0);
    ctx.strokeStyle = "#ff0000";
    ctx.beginPath();
    ctx.rect(iCropLeft, iCropTop, iCropWidth, iCropHeight);
    ctx.stroke();
}

// 이미지를 crop 하여서 하단 Canvas 에 그려준다.
async function CropImage($div,canvas, crop_canvas) {
    // var canvas = document.getElementById("canvas");
const imgTag = $div.find(".file-upload-image");
    img = new Image();
    img.onload = function () {
        // var canvas = document.getElementById("canvas_crop");
   /*     crop_canvas.width = iCropWidth;
        crop_canvas.height = iCropHeight;
        var ctx = crop_canvas.getContext("2d");
        ctx.drawImage(img, iCropLeft, iCropTop, iCropWidth, iCropHeight, 0, 0, iCropWidth, iCropHeight);*/

        // var cc = $div.find(".crop")document.getElementsByClassName("canvas_crop")[0];
        var new_img = document.getElementById("testImg");
        var ctx = crop_canvas.getContext("2d");
        ctx.drawImage(new_img, 0, 0, crop_canvas.width, crop_canvas.height, 0, 0, crop_canvas.width, crop_canvas.height);
        new_img.src = crop_canvas.toDataURL();
    };
    // const maleModel = await tf.serialization.registerClass();

    const resizeImg = await tf.image.resizeBilinear(tf.browser.fromPixels(canvas), [224, 224]).div(tf.scalar(255));
    // const normImg = resizeImg / 255.
    const inputTensor = tf.expandDims(resizeImg);
    const pred = maleModel.predict(inputTensor);
    const score = pred.dataSync()
    resultSet[resVal].score = score
    const resultIndex = resStr[pred.as1D().argMax().dataSync()[0]]
    resultSet[resVal].result =resultIndex;
    resultSet[resVal].onLoad = true;

    imgTag.hide();
    $(canvas).show();

    const onload1 = resultSet[0].onLoad;
    const onload2 = resultSet[1].onLoad;
    if(onload1 && onload2) {
        var str ;
        if(resultSet[0].score > resultSet[1].score) {
             str = resultSet[0].name +"이(가)"+ resultSet[1].name + "보다" + ((resultSet[0].score[0]-resultSet[1].score[0])*100).toFixed(1) +"% 만큼 잘생김";
        }else {
            str = resultSet[1].name +"이(가)"+ resultSet[0].name + "보다" + ((resultSet[1].score[0]-resultSet[0].score[0])*100).toFixed(1) +"% 만큼 잘생김";
        }
        toast.toast("info", str, "center")
        console.log(str)
    }else {
        toast.toast("success", resultIndex, "center")
    }



    img.src = canvas.toDataURL();
}

function removeUpload() {
    $('.file-upload-input').replaceWith($('.file-upload-input').clone());
    $('.file-upload-content').hide();
    $('.image-upload-wrap').show();
}

$('.image-upload-wrap').bind('dragover', function () {
    $('.image-upload-wrap').addClass('image-dropping');
});
$('.image-upload-wrap').bind('dragleave', function () {
    $('.image-upload-wrap').removeClass('image-dropping');
});
