document.getElementById('image-form').addEventListener('submit', async event => {
    event.preventDefault();
    const imageUrl = document.getElementById('image-url').value.trim();
    const statusDiv = document.getElementById('status');

    if (!imageUrl) {
        statusDiv.textContent = 'Please provide an image URL.';
        return;
    }

    statusDiv.textContent = 'Processing...';

    try {
        const response = await fetch('/api/search-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ imageUrl }),
        });

        const result = await response.json();
        if (result.success) {
            statusDiv.textContent = 'Image search completed!';
        } else {
            statusDiv.textContent = `Error: ${result.message}`;
        }
    } catch (error) {
        statusDiv.textContent = 'An error occurred while processing your request.';
    }
});
