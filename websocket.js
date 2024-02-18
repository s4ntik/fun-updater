const socket = new WebSocket('wss://obsy.fly.dev/:3000');
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'image') {
        loadImage(data.src);
    } else if (data.type === 'position') {
        posX = data.x;
        posY = data.y;
        rotation = data.rotation;
        opacity = data.opacity;
        mirror = data.mirror;
        resize = data.resize;
        updateImageStyle();
    }
};

function sendPositionUpdate() {
    const data = JSON.stringify({
        type: 'position',
        x: posX,
        y: posY,
        rotation: rotation,
        opacity: opacity,
        mirror: mirror,
        resize: resize
    });
    socket.send(data);
}

document.getElementById('opacity').addEventListener('input', function(event) {
    opacity = event.target.value;
    document.getElementById('opacity-input').value = opacity;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('opacity-input').addEventListener('change', function(event) {
    opacity = event.target.value;
    document.getElementById('opacity').value = opacity;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('apply-opacity').addEventListener('click', function(event) {
    const opacityInput = document.getElementById('opacity-input').value;
    opacity = opacityInput;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('image-url').addEventListener('change', function(event) {
    const imageUrl = event.target.value;
    loadImage(imageUrl);
    const data = JSON.stringify({ type: 'image', src: imageUrl });
    socket.send(data);
});

document.getElementById('apply-url').addEventListener('click', function(event) {
    const imageUrl = document.getElementById('image-url').value;
    loadImage(imageUrl);
    const data = JSON.stringify({ type: 'image', src: imageUrl });
    socket.send(data);
});

document.getElementById('rotation').addEventListener('input', function(event) {
    rotation = event.target.value;
    document.getElementById('rotation-input').value = rotation;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('rotation-input').addEventListener('change', function(event) {
    rotation = event.target.value;
    document.getElementById('rotation').value = rotation;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('apply-rotation').addEventListener('click', function(event) {
    const rotationInput = document.getElementById('rotation-input').value;
    rotation = rotationInput;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('mirror').addEventListener('change', function(event) {
    mirror = event.target.checked;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('apply-mirror').addEventListener('click', function(event) {
    mirror = !mirror;
    document.getElementById('mirror').checked = mirror;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('resize').addEventListener('input', function(event) {
    resize = event.target.value;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('apply-resize').addEventListener('click', function(event) {
    const resizeInput = document.getElementById('resize').value;
    resize = resizeInput;
    updateImageStyle();
    sendPositionUpdate();
});

document.getElementById('send-position').addEventListener('click', function(event) {
    sendPositionUpdate();
});
