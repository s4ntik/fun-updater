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

const socket = new WebSocket('wss://obsy.fly.dev/:3000');
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  if (data.type === 'image') {
    loadImage(data.src);
  }
  else if (data.type === 'position') {
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
  const data = JSON.stringify({ type: 'position', x: posX, y: posY, rotation: rotation, opacity: opacity, mirror: mirror, resize: resize });
  socket.send(data);
}

image.addEventListener('click', function(event) {
  if (!selected) {
    image.classList.add('selected');
    selected = true;
    startX = event.clientX;
    startY = event.clientY;
  }
});

document.addEventListener('mousemove', function(event) {
  if (selected) {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    posX += deltaX;
    posY += deltaY;
    startX = event.clientX;
    startY = event.clientY;
    updateImageStyle();
    sendPositionUpdate();
  }
});

document.addEventListener('mouseup', function(event) {
  if (selected) {
    image.classList.remove('selected');
    selected = false;
  }
});

function sendPositionUpdate() {
  const data = JSON.stringify({ type: 'position', x: posX, y: posY, rotation: rotation, opacity: opacity, mirror: mirror, resize: resize });
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

image.addEventListener('mousedown', function(event) {
  let startX = event.clientX;
  let startY = event.clientY;
  const startRotation = rotation;

  function handleMove(event) {
    const deltaX = event.clientX - startX;
    const deltaY = event.clientY - startY;
    posX += deltaX;
    posY += deltaY;
    sendPositionUpdate();
    startX = event.clientX;
    startY = event.clientY;
  }

  function handleRotate(event) {
    const deltaY = event.clientY - startY;
    rotation = startRotation + deltaY;
    sendPositionUpdate();
  }

  function stopDragging() {
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('mousemove', handleRotate);
    document.removeEventListener('mouseup', stopDragging);
  }

  document.addEventListener('mousemove', handleMove);
  document.addEventListener('mouseup', stopDragging);
});

image.addEventListener('contextmenu', function(event) {
  event.preventDefault();
});
