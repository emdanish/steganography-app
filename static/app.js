document.addEventListener('DOMContentLoaded', function() {
    initializeUI();
});

function initializeUI() {
    addDragDropSupport();
    addButtonEffects();
    addImagePreviewSupport();
}

function addDragDropSupport() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        const formGroup = input.closest('.form-group');
        
        formGroup.addEventListener('dragover', (e) => {
            e.preventDefault();
            formGroup.classList.add('dragover');
        });
        
        formGroup.addEventListener('dragleave', () => {
            formGroup.classList.remove('dragover');
        });
        
        formGroup.addEventListener('drop', (e) => {
            e.preventDefault();
            formGroup.classList.remove('dragover');
            
            if (e.dataTransfer.files.length) {
                input.files = e.dataTransfer.files;
                
                const event = new Event('change');
                input.dispatchEvent(event);
            }
        });
    });
}

function addButtonEffects() {
    const buttons = document.querySelectorAll('button, .download-button');
    
    buttons.forEach(button => {
        button.addEventListener('mousedown', () => {
            button.style.transform = 'scale(0.95)';
        });
        
        button.addEventListener('mouseup', () => {
            button.style.transform = '';
        });
        
        button.addEventListener('mouseleave', () => {
            button.style.transform = '';
        });
    });
}

function addImagePreviewSupport() {
    const fileInputs = document.querySelectorAll('input[type="file"]');
    
    fileInputs.forEach(input => {
        input.addEventListener('change', function() {
            const formGroup = input.closest('.form-group');
            let previewContainer = formGroup.querySelector('.file-preview');
            
            if (!previewContainer) {
                previewContainer = document.createElement('div');
                previewContainer.className = 'file-preview';
                formGroup.appendChild(previewContainer);
            } else {
                previewContainer.innerHTML = '';
            }
            
            if (this.files && this.files[0]) {
                const reader = new FileReader();
                
                reader.onload = function(e) {
                    const img = document.createElement('img');
                    img.src = e.target.result;
                    img.alt = 'Preview';
                    
                    const fileName = document.createElement('div');
                    fileName.className = 'file-name';
                    fileName.textContent = input.files[0].name;
                    
                    previewContainer.appendChild(img);
                    previewContainer.appendChild(fileName);
                    
                    formGroup.classList.add('has-preview');
                };
                
                reader.readAsDataURL(this.files[0]);
            } else {
                formGroup.classList.remove('has-preview');
            }
        });
    });
}

document.getElementById('hide-button').addEventListener('click', async () => {
    const carrierInput = document.getElementById('carrier-image');
    const secretInput = document.getElementById('secret-image');
    
    if (!carrierInput.files[0] || !secretInput.files[0]) {
        showErrorMessage('Please select both carrier and secret images');
        return;
    }
    
    const formData = new FormData();
    formData.append('carrier', carrierInput.files[0]);
    formData.append('secret', secretInput.files[0]);
    
    try {
        const statusEl = document.getElementById('hide-status');
        statusEl.textContent = 'Processing...';
        statusEl.className = 'processing';
        document.body.style.cursor = 'wait';
        
        const hideButton = document.getElementById('hide-button');
        hideButton.disabled = true;
        
        const response = await fetch('/api/hide', {
            method: 'POST',
            body: formData
        });
        
        document.body.style.cursor = 'default';
        hideButton.disabled = false;
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error creating steganographic image');
        }
        
        if (!response.ok) {
            throw new Error('Error creating steganographic image');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        statusEl.textContent = 'Success!';
        statusEl.className = 'success';
        
        const resultImage = document.getElementById('result-image');
        resultImage.src = url;
        resultImage.onload = () => {
            document.getElementById('result-download').href = url;
            document.getElementById('result-download').download = 'steganography_result.png';
            document.getElementById('result-modal').style.display = 'flex';
        };
    } catch (error) {
        document.getElementById('hide-status').textContent = '';
        showErrorMessage(error.message);
    }
});

document.getElementById('extract-button').addEventListener('click', async () => {
    const stegoInput = document.getElementById('stego-image');
    
    if (!stegoInput.files[0]) {
        showErrorMessage('Please select a steganographic image');
        return;
    }
    
    const formData = new FormData();
    formData.append('stego', stegoInput.files[0]);
    
    try {
        const statusEl = document.getElementById('extract-status');
        statusEl.textContent = 'Processing...';
        statusEl.className = 'processing';
        document.body.style.cursor = 'wait';
        
        const extractButton = document.getElementById('extract-button');
        extractButton.disabled = true;
        
        const response = await fetch('/api/extract', {
            method: 'POST',
            body: formData
        });
        
        document.body.style.cursor = 'default';
        extractButton.disabled = false;
        
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error extracting hidden image');
        }
        
        if (!response.ok) {
            throw new Error('Error extracting hidden image');
        }
        
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        statusEl.textContent = 'Success!';
        statusEl.className = 'success';
        
        const resultImage = document.getElementById('result-image');
        resultImage.src = url;
        resultImage.onload = () => {
            document.getElementById('result-download').href = url;
            document.getElementById('result-download').download = 'extracted_result.png';
            document.getElementById('result-modal').style.display = 'flex';
        };
    } catch (error) {
        document.getElementById('extract-status').textContent = '';
        showErrorMessage(error.message);
    }
});

function showErrorMessage(message) {
    const errorModal = document.getElementById('error-modal');
    const errorText = document.getElementById('error-text');
    
    errorText.textContent = message;
    errorModal.style.display = 'flex';
    
    setTimeout(() => {
        document.querySelector('.error-content').classList.add('show');
    }, 10);
}

document.querySelectorAll('.close-modal').forEach(button => {
    button.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal');
        document.querySelector('.modal-content').classList.remove('show');
        
        setTimeout(() => {
            modal.style.display = 'none';
        }, 300);
    });
});

window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        document.querySelector('.modal-content').classList.remove('show');
        
        setTimeout(() => {
            e.target.style.display = 'none';
        }, 300);
    }
}); 