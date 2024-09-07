const socket = new WebSocket('wss://obsy.fly.dev/:3000');

let selectedImageId = null;
let opacity = 1;
let rotation = 0;
let mirror = false;
let resize = 1;

// Function to load an image
function loadImage(url, id) {
    const img = document.getElementById(id);
    if (img) {
        img.src = url;
    }
}

// Function to update the style of an image
function updateImageStyle(id, properties) {
    const img = document.getElementById(id);
    if (img) {
        img.style.left = `${properties.x}px`;
        img.style.top = `${properties.y}px`;
        img.style.transform = `rotate(${properties.rotation}deg) ${properties.mirror ? 'scaleX(-1)' : ''} ${properties.resize !== 1 ? `scale(${properties.resize})` : ''}`;
        img.style.opacity = properties.opacity;
    }
}

// Handle incoming messages from WebSocket
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'images') {
        // Clear existing images
        const container = document.getElementById('image-container');
        container.innerHTML = '';

        // Add new images
        for (const [id, properties] of Object.entries(data.images)) {
            const imgElement = document.createElement('img');
            imgElement.src = properties.src;
            imgElement.id = id;
            imgElement.style.position = 'fixed';
            imgElement.style.left = `${properties.x}px`;
            imgElement.style.top = `${properties.y}px`;
            imgElement.style.transform = `rotate(${properties.rotation}deg) ${properties.mirror ? 'scaleX(-1)' : ''} ${properties.resize !== 1 ? `scale(${properties.resize})` : ''}`;
            imgElement.style.opacity = properties.opacity;
            imgElement.addEventListener('click', () => {
                selectedImageId = id;
                updateControls(id);
            });
            container.appendChild(imgElement);
        }
    }
}

// Update controls based on selected image
function updateControls(id) {
    const img = document.getElementById(id);
    if (img) {
        opacity = img.style.opacity;
        rotation = parseFloat(img.style.transform.match(/rotate\(([^)]+)\)/)[1]);
        mirror = img.style.transform.includes('scaleX(-1)');
        resize = img.style.transform.includes('scale(') ? parseFloat(img.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1;

        document.getElementById('opacity').value = opacity;
        document.getElementById('opacity-input').value = opacity;
        document.getElementById('rotation').value = rotation;
        document.getElementById('rotation-input').value = rotation;
        document.getElementById('mirror').checked = mirror;
        document.getElementById('resize').value = resize;
    }
}

// Event listeners for control elements
document.getElementById('opacity').addEventListener('input', function() {
    opacity = this.value;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { opacity });
    }
});

document.getElementById('opacity-input').addEventListener('change', function() {
    opacity = this.value;
    document.getElementById('opacity').value = opacity;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { opacity });
    }
});

document.getElementById('rotation').addEventListener('input', function() {
    rotation = this.value;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { rotation });
    }
});

document.getElementById('rotation-input').addEventListener('change', function() {
    rotation = this.value;
    document.getElementById('rotation').value = rotation;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { rotation });
    }
});

document.getElementById('mirror').addEventListener('change', function() {
    mirror = this.checked;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { mirror });
    }
});

document.getElementById('resize').addEventListener('input', function() {
    resize = this.value;
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { resize });
    }
});

document.getElementById('add-image').addEventListener('click', () => {
    const url = document.getElementById('image-url').value;
    const data = JSON.stringify({
        type: 'add_image',
        src: url,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        mirror: false,
        resize: 1
    });
    socket.send(data);
});

document.getElementById('delete-image').addEventListener('click', () => {
    if (selectedImageId) {
        const data = JSON.stringify({ type: 'delete_image', id: selectedImageId });
        socket.send(data);
        selectedImageId = null;
    }
});