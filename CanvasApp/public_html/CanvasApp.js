/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var canvas = document.getElementById('canvas');
var context = canvas.getContext('2d');

var dragging = false;

var imageArray = [];
var popped = [];

var radius = 10,
        minRad = 2,
        maxRad = 50,
        defaultRad = 20,
        interval = 2;

var colors = ['black', 'grey', 'white', 'red', 'orange', 'yellow', 'green', 'blue', 'cyan', 'indigo', 'violet'];

for (var i = 0, n = colors.length; i < n; i++) {
    var swatch = document.createElement('div');
    swatch.className = 'swatch';
    swatch.style.backgroundColor = colors[i];
    swatch.addEventListener('click', setSwatch, false);
    document.getElementById('colors').appendChild(swatch);
}

var radSpan = document.getElementById('radval'),
        decRad = document.getElementById('decrad'),
        incRad = document.getElementById('incrad'),
        swatches = document.getElementsByClassName('swatch'),
        saveButton = document.getElementById('save'),
        clearButton = document.getElementById('clear'),
        undoButton = document.getElementById('undo'),
        redoButton = document.getElementById('redo');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

context.lineWidth = radius * 2;

setRadius(defaultRad);


function putPoint(e) {
    if (dragging)
    {
        context.lineTo(e.offsetX, e.offsetY);
        context.stroke();
        context.beginPath();
        //context.arc(e.clientX, e.clientY, radius, 0, Math.PI*2);
        context.arc(e.offsetX, e.offsetY, radius, 0, Math.PI * 2);
        context.fill();

        context.beginPath();
        context.moveTo(e.offsetX, e.offsetY);
    }
}

function engage(e) {
    dragging = true;
    putPoint(e);
}

function disengage() {
    dragging = false;
    context.beginPath();

    lastImage = context.getImageData(0, 0, canvas.width, canvas.height);
    imageArray.push(context.getImageData(0, 0, canvas.width, canvas.height));
}

function reDrawImage() {
    if (imageArray.length == 0) {
        clearCanvas();
    } else if (imageArray.length < 0) {
        // something is wrong here!
        console.log("Just deny this function");
        return;
    }

    clearCanvas();

    for (var i = 0, l = imageArray.length; i < l; i++)
    {
        context.putImageData(imageArray[i], 0, 0);
    }
}

function undo() {
    popped.push(imageArray.pop());
    reDrawImage();
}

function redo() {
    if (popped.length >= 0) {
        var lastIndex = popped.length - 1;
        imageArray.push(popped[lastIndex]);
        popped.pop();
        reDrawImage();
    }
    // something is wrong here!
    else {
        console.log("Just deny this function");
        return;
    }
}

function setRadius(newRadius) {
    if (newRadius < minRad)
        newRadius = minRad;

    else if (newRadius > maxRad)
        newRadius = maxRad;

    radius = newRadius;
    context.lineWidth = radius * 2;
    radSpan.innerHTML = radius;
}

function setColor(color) {
    context.fillStyle = color;
    context.strokeStyle = color;
    var active = document.getElementsByClassName('active')[0];
    if (active) {
        active.className = 'swatch';
    }
}

function setSwatch(e) {
    var swatch = e.target;
    setColor(swatch.style.backgroundColor);
    swatch.className += ' active';
}

function saveImage() {
    var data = canvas.toDataURL();

    var request = new XMLHttpRequest();

    request.onreadystatechange = function () {
        if (request.readyState == 4 && request.status == 200) {
            var response = request.responseText;
            window.open(response, '_blank', 'location=0, menubar=0');
        }
    };

    request.open('POST', 'save.php', true);
    request.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    request.send('img=' + data);
    window.open(data, '_blank', 'location=0, menubar=0');
}

function clearCanvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

setSwatch({target: document.getElementsByClassName('swatch')[0]});

canvas.addEventListener('mousemove', putPoint, false);
canvas.addEventListener('mousedown', engage, false);
canvas.addEventListener('mouseup', disengage, false);

decRad.addEventListener('click', function () {
    setRadius(radius - interval);
}, false);

incRad.addEventListener('click', function () {
    setRadius(radius + interval);
}, false);

saveButton.addEventListener('click', saveImage, false);
clearButton.addEventListener('click', clearCanvas, false);
undoButton.addEventListener('click', undo, false);
redoButton.addEventListener('click', redo, false);