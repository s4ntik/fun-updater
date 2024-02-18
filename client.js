const image = document.getElementById('moving-image');
let posX = 0;
let posY = 0;
let rotation = 0;
let opacity = 1;
let mirror = false;
let resize = 1;
let selected = false;
let startX = 0;
let startY = 0;
let requestId = null;

function updateImageStyle() {
    let transformValue = `translate(${posX}px, ${posY}px) rotate(${rotation}deg)`;
    if (mirror) {
        transformValue += ' scaleX(-1)';
    }
    if (resize !== 1) {
        transformValue += ` scale(${resize})`;
    }
    image.style.transform = transformValue;
    image.style.opacity = opacity;
}

function loadImage(url) {
    image.src = url;
}

document.addEventListener('mousemove', function(event) {
    if (selected) {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        posX += deltaX;
        posY += deltaY;
        startX = event.clientX;
        startY = event.clientY;

        if (!requestId) {
            requestId = requestAnimationFrame(function() {
                updateImageStyle();
                requestId = null;
            });
        }
    }
});

document.addEventListener('mousedown', function(event) {
    if (!selected && event.target === image) {
        selected = true;
        startX = event.clientX;
        startY = event.clientY;
    }
});

document.addEventListener('mouseup', function(event) {
    if (selected) {
        selected = false;
    }
});

image.addEventListener('mousedown', function(event) {
    let startX = event.clientX;
    let startY = event.clientY;
    const startRotation = rotation;

    function handleMove(event) {
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;
        posX += deltaX;
        posY += deltaY;
        startX = event.clientX;
        startY = event.clientY;
    }

    function handleRotate(event) {
        const deltaY = event.clientY - startY;
        rotation = startRotation + deltaY;
    }

    function stopDragging() {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mousemove', handleRotate);
        document.removeEventListener('mouseup', stopDragging);
    }

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mouseup', stopDragging);
});

// Prevent default context menu on right-click
document.addEventListener('contextmenu', function(event) {
    event.preventDefault();
});
