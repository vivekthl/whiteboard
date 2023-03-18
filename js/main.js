//Variables

var canvas;
var cursorCanvas;
var selectorCanvas;

var canvasContext;
var cursorCanvasContext;
var selectorCanvasContext;

var displaySize;

var drawingEnabled = false;
var markerColor = "darkblue";
var toolbarVisibility = 0;
var markerSize = 4;
var contrainYMovement = false;
var contrainXMovement = false;

var selectorOn = false;
var selectorStartX = 0;
var selectorStartY = 0;
var selectorStopX = window.innerWidth;
var selectorStopY = window.innerHeight;
var firstMouseDownAfterSelectorOn = true;

var currentX = 0, currentY = 0;
var previousX = 0, previousY = 0;

//Logic 

function selectAction(action, event)
{
    if(action == 'up')
    {
        drawingEnabled = false;
    }
    else if(action == 'down')
    {
        previousX = currentX;
        previousY = currentY;
        currentX = event.clientX;
        currentY = event.clientY;
        drawingEnabled = true;
        if(selectorOn && firstMouseDownAfterSelectorOn)
        {
            firstMouseDownAfterSelectorOn = false;
            selectorStartX = currentX;
            selectorStartY = currentY;
        }
    }
    else if(action == 'move')
    {
        previousX = currentX;
        previousY = currentY;
        currentX = event.clientX;
        currentY = event.clientY;
        if(contrainYMovement)
        {
            currentY = previousY;
        }
        if(contrainXMovement)
        {
            currentX = previousX;
        }
        if(drawingEnabled && !selectorOn)
        {
            draw();
        }
        if(selectorOn && (firstMouseDownAfterSelectorOn == false))
        {
            drawSelector(event);
        }
    }
}

function setMarkerColor(color)
{
    markerColor =  color;
}

// Selector Logic

function startSelector()
{
    selectorOn = true;
    cursorCanvas.style.cursor = "crosshair";
}

function stopSelector()
{
    if(selectorOn)
    {
        selectorOn = false;
        cursorCanvas.style.cursor = "none";
        firstMouseDownAfterSelectorOn = true;
        selectorStopX =  currentX;
        selectorStopY = currentY;
    }
}

//Drawing

function draw()
{
    canvasContext.beginPath();      
    canvasContext.moveTo(previousX, previousY)
    canvasContext.lineTo(currentX, currentY);
    canvasContext.fillStyle = markerColor;
    canvasContext.strokeStyle = markerColor;
    canvasContext.lineJoin = "round";
    canvasContext.closePath();
    canvasContext.stroke();
}

function drawPoint()
{
    canvasContext.beginPath();
    canvasContext.fillStyle = markerColor ;
    canvasContext.arc(currentX, currentY, markerSize/2, 0, 2*Math.PI);
    canvasContext.fill();
}


function drawSelector(event) 
{
    selectorCanvasContext.clearRect(0, 0, 
                                    cursorCanvas.width, 
                                    cursorCanvas.height);

    selectorCanvasContext.strokeStyle = 'black';
    selectorCanvasContext.lineWidth = 1;
    selectorCanvasContext.beginPath();
    selectorCanvasContext.setLineDash([6]);

    if(event.clientX && event.clientY)
    {
        selectorCanvasContext.strokeRect(selectorStartX, 
                                         selectorStartY, 
                                         event.clientX-selectorStartX, 
                                         event.clientY-selectorStartY);
    }
}

function drawCursor(event) 
{
    if(!selectorOn)
    {
        cursorCanvasContext.clearRect(0, 0, 
                                      cursorCanvas.width, 
                                      cursorCanvas.height);

        cursorCanvasContext.strokeStyle = 'black';
        cursorCanvasContext.lineWidth = 1;
        cursorCanvasContext.beginPath();

        if(event.clientX && event.clientY)
        {
            cursorCanvasContext.arc(event.clientX, 
                                    event.clientY, markerSize/2, 
                                    0, Math.PI * 2);
        }
        else
        {
            cursorCanvasContext.arc(previousX, previousY, 
                                    markerSize/2, 0, Math.PI * 2);
        }
        cursorCanvasContext.stroke();
    }
}

function clearCanvas()
{
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    canvasContext.fillStyle = "white";
    canvasContext.fillRect(0, 0, canvas.width, canvas.height);
    selectorCanvasContext.clearRect(0, 0, 
                                    cursorCanvas.width, 
                                    cursorCanvas.height);

    //Reset selector
    selectorStartX = 0;
    selectorStartY = 0;
    selectorStopX = window.innerWidth;
    selectorStopY = window.innerHeight;
}

//Key Processing

function processKey(event)
{
    if(event.keyCode == 67) //Key:c, Clear
    {
        clearCanvas();
    }

    if(event.keyCode == 83) //Key:s, Save
    {
        var dataURL = canvas.toDataURL("image/png").replace("image/png", 
                                                            "image/octet-stream"); 
        download("whiteboard");
    }

    if(event.keyCode == 84) //Key:t, Toolbox
    {
        toolbarVisibility = Math.abs(1-toolbarVisibility);
        var toolBox = document.getElementById("toolBox");
        if(toolbarVisibility)
        {
            toolBox.style.width = "30px";
            toolBox.querySelector("#selector").style.margin = "5px";
            toolBox.querySelector("#selector").style.width = "20px";
            toolBox.querySelector("#selector").style.visibility = "visible";
        }
        else
        {
            toolBox.style.width = "0";
            toolBox.querySelector("#selector").style.margin = "0px";
            toolBox.querySelector("#selector").style.width = "0px";
            toolBox.querySelector("#selector").style.visibility = "hidden";

        }
    }

    if(event.shiftKey)
    {
        contrainYMovement = true;
    }

    if(event.ctrlKey)
    {
        contrainXMovement = true;
    }
    
    if(event.keyCode == 187) //Key:+, Makersize ++
    {
        markerSize++;

        displaySize.style.visibility = "visible";
        displaySize.innerHTML = markerSize;

        canvasContext.lineWidth  = markerSize;
        drawCursor(event);
    }
    else if(event.keyCode == 189) //Key:-, Markersize --
    {
        if(markerSize > 3)
        {
            markerSize--;
        }

        displaySize.style.visibility = "visible";
        displaySize.innerHTML = markerSize;

        canvasContext.lineWidth = markerSize;
        drawCursor(event);
    }
}

function processOnKeyUp(event)
{
    if(!event.shiftKey)
    {
        contrainYMovement = false;
    }

    if(!event.ctrlKey)
    {
        contrainXMovement = false;
    }

    if(event.keyCode == 187) //Makersize ++
    {
        displaySize.style.visibility = "hidden";        
    }
    else if(event.keyCode == 189) //Markersize --
    {
        displaySize.style.visibility = "hidden";
    }
}

function download(filename) 
{
    var imageData = canvasContext.getImageData(
        selectorStartX,
        selectorStartY,
        selectorStopX,
        selectorStopY);

    var saveCanvas = document.createElement("canvas");
    saveCanvas.width = selectorStopX-selectorStartX;
    saveCanvas.height = selectorStopY-selectorStartY;
    var saveCanvasContext = saveCanvas.getContext('2d');
    saveCanvasContext.putImageData(imageData, 0, 0);


    var link = document.createElement('a'), e;
    link.download = filename;
    link.href = saveCanvas.toDataURL();
    if (document.createEvent) 
    {
        e = document.createEvent("MouseEvents");
        e.initMouseEvent("click", true, true, window,
                         0, 0, 0, 0, 0, false, false, false,
                         false, 0, null);
        
        link.dispatchEvent(e);
        
    } 
    else if (lnk.fireEvent) 
    {
        link.fireEvent("onclick");
    }
}




