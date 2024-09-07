const iframe = document.getElementById('iframe-container').querySelector('iframe');
const imageUrlInput = document.getElementById('image-url');
const opacityInput = document.getElementById('opacity');
const opacityValueInput = document.getElementById('opacity-input');
const rotationInput = document.getElementById('rotation');
const rotationValueInput = document.getElementById('rotation-input');
const mirrorCheckbox = document.getElementById('mirror');
const resizeInput = document.getElementById('resize');
const addImageButton = document.getElementById('add-image');
const deleteImageButton = document.getElementById('delete-image');
const controlsContainer = document.getElementById('controls-container');
const imagesButton = document.getElementById('images-button');

let selectedImageId = null;
let position = { x: 0, y: 0 }; // Track the position
let isDragging = false; // Track dragging state

// Set up WebSocket connection
const socket = new WebSocket('wss://obsy.fly.dev/:3000');

// Post a message to the iframe with data to update
function postMessageToIframe(data) {
    iframe.contentWindow.postMessage(data, '*');
}

// Listen for messages from the iframe
window.addEventListener('message', (event) => {
    const { type, id, properties } = event.data;

    if (type === 'image_selected') {
        selectedImageId = id;
        updateControls(properties);
        controlsContainer.style.display = 'block'; // Show controls
    } else if (type === 'image_deleted') {
        selectedImageId = null;
        controlsContainer.style.display = 'none'; // Hide controls
    }
});

// Update control inputs with image properties when an image is selected
function updateControls(properties) {
    if (properties) { // Ensure properties exist before updating controls
        opacityInput.value = properties.opacity;
        opacityValueInput.value = properties.opacity;
        rotationInput.value = properties.rotation;
        rotationValueInput.value = properties.rotation;
        mirrorCheckbox.checked = properties.mirror;
        resizeInput.value = properties.resize;
        position.x = properties.x; // Set position
        position.y = properties.y;
    }
}

// Example: Adding an image via WebSocket
addImageButton.addEventListener('click', () => {
    const url = imageUrlInput.value;
    const data = {
        type: 'add_image',
        src: url,
        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1,
        mirror: false,
        resize: 1
    };
    socket.send(JSON.stringify(data)); // Send via WebSocket
});

// Example: Deleting an image via WebSocket
deleteImageButton.addEventListener('click', () => {
    if (selectedImageId) {
        const data = {
            type: 'delete_image',
            id: selectedImageId
        };
        socket.send(JSON.stringify(data)); // Send via WebSocket
        selectedImageId = null;
    }
});

// Example: Updating an image via WebSocket (with position)
function sendImageUpdate(id, properties) {
    const data = JSON.stringify({
        type: 'update_image',
        id,
        properties: { ...properties, x: position.x, y: position.y } // Include position
    });
    console.log('Sending update:', data); // Log data being sent
    socket.send(data);
}

// Check if mouse is within the iframe bounds
function isMouseWithinIframe(event) {
    const iframeRect = iframe.getBoundingClientRect();
    return (
        event.clientX >= iframeRect.left &&
        event.clientX <= iframeRect.right &&
        event.clientY >= iframeRect.top &&
        event.clientY <= iframeRect.bottom
    );
}

// Handle position changes
function onMouseMove(event) {
    if (isDragging && selectedImageId && isMouseWithinIframe(event)) {
        position.x = event.clientX - iframe.getBoundingClientRect().left; // Adjust position relative to iframe
        position.y = event.clientY - iframe.getBoundingClientRect().top;  // Adjust position relative to iframe
        sendImageUpdate(selectedImageId, { x: position.x, y: position.y });
    }
}

// Handle mouse up event to stop dragging
function onMouseUp() {
    if (isDragging) {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// Handling inputs for image updates
opacityInput.addEventListener('input', () => {
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { opacity: opacityInput.value });
    }
});

rotationInput.addEventListener('input', () => {
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { rotation: rotationInput.value });
    }
});

mirrorCheckbox.addEventListener('change', () => {
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { mirror: mirrorCheckbox.checked });
    }
});

resizeInput.addEventListener('input', () => {
    if (selectedImageId) {
        sendImageUpdate(selectedImageId, { resize: resizeInput.value });
    }
});

// Start dragging on mouse down
document.addEventListener('mousedown', (event) => {
    if (selectedImageId && isMouseWithinIframe(event)) {
        isDragging = true;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    }
});
