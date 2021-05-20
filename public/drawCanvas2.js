var canvas,
    context,
    dragging = false,
    dragStartLocation,
    snapshot;


function getCanvasCoordinates(event) {
    var x = event.clientX - canvas.getBoundingClientRect().left,
        y = event.clientY - canvas.getBoundingClientRect().top;

    return {x: x, y: y};
}

function takeSnapshot() {
    snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

function restoreSnapshot() {
    context.putImageData(snapshot, 0, 0);
}

function drawCircle(position) {
    var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
    context.beginPath();
    context.arc(dragStartLocation.x, dragStartLocation.y, radius, 0, 2 * Math.PI, false);
    context.fillStyle = getRndColor();
}


function draw(position) {

    var fillBox = document.getElementById("fillBox"),
        shape = document.querySelector('input[type="radio"][name="shape"]:checked').value;
    if (shape === "circle") {
        drawCircle(position);
    }

    if (fillBox.checked) {
        context.fill();
    } else {
        context.stroke();
    }
}

function dragStart(event) {
    dragging = true;
    dragStartLocation = getCanvasCoordinates(event);
    takeSnapshot();
}

function drag(event) {
    var position;
    if (dragging === true) {
        restoreSnapshot();
        position = getCanvasCoordinates(event);
        draw(position, "polygon");
    }
}

function dragStop(event) {
    dragging = false;
    restoreSnapshot();
    var position = getCanvasCoordinates(event);
    draw(position, "polygon");
}

function getRndColor() {
    var r = 255*Math.random()|0,
        g = 255*Math.random()|0,
        b = 255*Math.random()|0;
    return 'rgb(' + r + ',' + g + ',' + b + ')';
}

function eraseCanvas(){
    context.clearRect(0, 0, canvas.width, canvas.height);
}


function init() {
    canvas = document.getElementById("canvas");
    context = canvas.getContext('2d');
    context.strokeStyle = 'green';
    context.lineWidth = 4;
    context.lineCap = 'round';
    clearCanvas = document.getElementById("clearCanvas");

    canvas.addEventListener('mousedown', dragStart, false);
    canvas.addEventListener('mousemove', drag, false);
    canvas.addEventListener('mouseup', dragStop, false);
    clearCanvas.addEventListener("click", eraseCanvas, false);

}

window.addEventListener('load', init, false);