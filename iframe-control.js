const imageContainer = document.getElementById('image-container');
let selectedImageId = null;
let selectedImage = null;
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

// Initialize WebSocket connection
const socket = new WebSocket('wss://obsy.fly.dev/:3000');

// Handle incoming WebSocket messages
socket.onmessage = function(event) {
    const data = JSON.parse(event.data);
    if (data.type === 'images') {
        imageContainer.innerHTML = ''; // Clear existing images
        for (const [id, properties] of Object.entries(data.images)) {
            const imgElement = createImageElement(id, properties.src, properties.x, properties.y, properties.rotation, properties.opacity, properties.mirror, properties.resize);
            imageContainer.appendChild(imgElement);
        }
    }
};

function createImageElement(id, src, x, y, rotation, opacity, mirror, resize) {
    const img = document.createElement('img');
    img.src = src;
    img.id = id;
    img.style.position = 'fixed';
    img.style.left = `${x}px`;
    img.style.top = `${y}px`;
    img.style.transform = `rotate(${rotation}deg) ${mirror ? 'scaleX(-1)' : ''} ${resize !== 1 ? `scale(${resize})` : ''}`;
    img.style.opacity = opacity;
    img.style.cursor = 'pointer';

    img.addEventListener('pointerdown', (event) => {
        if (event.button === 0) { // Left mouse button
            selectImage(id, img, event);
        }
    });

    return img;
}

function selectImage(id, img, event) {
    selectedImageId = id;
    selectedImage = img;
    offsetX = event.clientX - img.getBoundingClientRect().left;
    offsetY = event.clientY - img.getBoundingClientRect().top;
    isDragging = true;

    window.parent.postMessage({
        type: 'image_selected',
        id: id,
        properties: {
            opacity: img.style.opacity,
            rotation: parseFloat(img.style.transform.match(/rotate\(([^)]+)\)/)[1]),
            mirror: img.style.transform.includes('scaleX(-1)'),
            resize: img.style.transform.includes('scale(') ? parseFloat(img.style.transform.match(/scale\(([^)]+)\)/)[1]) : 1
        }
    }, '*');

    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup', onPointerUp);
}

function onPointerMove(event) {
    if (isDragging && selectedImage) {
        const rect = selectedImage.getBoundingClientRect();
        const x = event.clientX - offsetX;
        const y = event.clientY - offsetY;
        selectedImage.style.left = `${x}px`;
        selectedImage.style.top = `${y}px`;

        sendImageUpdate(selectedImageId, { x, y });
    }
}

function onPointerUp() {
    if (isDragging) {
        console.log('Pointer up detected. Stopping drag.'); // Debugging line
        isDragging = false;
        selectedImage = null;
        document.removeEventListener('pointermove', onPointerMove);
        document.removeEventListener('pointerup', onPointerUp);
    }
}

function sendImageUpdate(id, properties) {
    const data = {
        type: 'update_image',
        id: id,
        properties: properties
    };

    socket.send(JSON.stringify(data));
}

function deleteSelectedImage() {
    if (selectedImageId) {
        const img = document.getElementById(selectedImageId);
        if (img) {
            imageContainer.removeChild(img);
            window.parent.postMessage({ type: 'image_deleted', id: selectedImageId }, '*');
        }
    }
}

window.addEventListener('message', (event) => {
    const { type, id, properties } = event.data;

    if (type === 'add_image') {
        if (properties) {
            const imgElement = createImageElement(id, properties.src, properties.x, properties.y, properties.rotation, properties.opacity, properties.mirror, properties.resize);
            imageContainer.appendChild(imgElement);
        } else {
            console.error('Properties are undefined for add_image');
        }
    } else if (type === 'update_image') {
        if (properties) {
            const img = document.getElementById(id);
            if (img) {
                img.style.left = `${properties.x}px`;
                img.style.top = `${properties.y}px`;
                img.style.transform = `rotate(${properties.rotation}deg) ${properties.mirror ? 'scaleX(-1)' : ''} ${properties.resize !== 1 ? `scale(${properties.resize})` : ''}`;
                img.style.opacity = properties.opacity;
            }
        } else {
            console.error('Properties are undefined for update_image');
        }
    } else if (type === 'delete_image') {
        deleteSelectedImage();
    }
});
