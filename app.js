document.addEventListener('DOMContentLoaded', () => {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    const carrierUploadBtn = document.querySelector('#carrier-upload .upload-btn');
    const secretUploadBtn = document.querySelector('#secret-upload .upload-btn');
    const stegoUploadBtn = document.querySelector('#stego-upload .upload-btn');
    
    const carrierFileInput = document.querySelector('#carrier-file');
    const secretFileInput = document.querySelector('#secret-file');
    const stegoFileInput = document.querySelector('#stego-file');
    
    const hideBtn = document.querySelector('#hide-btn');
    const extractBtn = document.querySelector('#extract-btn');
    
    const resultModal = document.querySelector('#result-modal');
    const closeModal = document.querySelector('.close-modal');
    const resultImage = document.querySelector('#result-image');
    const resultTitle = document.querySelector('#result-title');
    const downloadResultBtn = document.querySelector('#download-result');
    const copyResultBtn = document.querySelector('#copy-result');
    
    const loadingOverlay = document.querySelector('#loading-overlay');
    
    const themeToggle = document.querySelector('.theme-toggle');
    
    window.carrierFile = null;
    window.secretFile = null;
    window.stegoFile = null;
    window.resultBlob = null;
    
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`${tabId}-content`).classList.add('active');
        });
    });
    
    carrierUploadBtn.addEventListener('click', () => carrierFileInput.click());
    secretUploadBtn.addEventListener('click', () => secretFileInput.click());
    stegoUploadBtn.addEventListener('click', () => stegoFileInput.click());
    
    carrierFileInput.addEventListener('change', (e) => {
        handleFileUpload(e, '#carrier-upload .preview', 'carrierFile');
    });
    
    secretFileInput.addEventListener('change', (e) => {
        handleFileUpload(e, '#secret-upload .preview', 'secretFile');
    });
    
    stegoFileInput.addEventListener('change', (e) => {
        handleFileUpload(e, '#stego-upload .preview', 'stegoFile');
    });
    
    function handleFileUpload(event, previewSelector, fileVariable) {
        const file = event.target.files[0];
        if (!file) return;
        
        const preview = document.querySelector(previewSelector);
        const reader = new FileReader();
        
        preview.innerHTML = '<div class="loading-preview"><i class="fas fa-spinner fa-spin"></i><p>Loading preview...</p></div>';
        preview.classList.add('show');
        
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                
                const clearBtn = document.createElement('button');
                clearBtn.className = 'clear-image-btn';
                clearBtn.innerHTML = '<i class="fas fa-times"></i>';
                clearBtn.title = 'Remove image';
                preview.appendChild(clearBtn);
                
                clearBtn.addEventListener('click', function(evt) {
                    evt.stopPropagation();
                    const inputEl = document.querySelector(previewSelector.replace('.preview', ' input[type="file"]'));
                    inputEl.value = '';

                    preview.innerHTML = '';
                    preview.classList.remove('show');

                    window[fileVariable] = null;
                    
                    const uploadBox = document.querySelector(previewSelector.replace('.preview', ''));
                    uploadBox.classList.remove('file-selected');

                    if (fileVariable === 'carrierFile' || fileVariable === 'secretFile') {
                        updateHideButtonState();
                    } else if (fileVariable === 'stegoFile') {
                        updateExtractButtonState();
                    }
                });
            };
            img.src = e.target.result;
            
            window[fileVariable] = file;
            
            if (fileVariable === 'carrierFile' || fileVariable === 'secretFile') {
                updateHideButtonState();
            } else if (fileVariable === 'stegoFile') {
                updateExtractButtonState();
            }
            
            console.log(`${fileVariable} set:`, file.name);
        };
        
        reader.onerror = function() {
            preview.innerHTML = `<div class="error-preview">Error loading image</div>`;
        };
        
        reader.readAsDataURL(file);
        
        const uploadBox = event.target.closest('.upload-box');
        uploadBox.classList.add('file-selected');
    }
    
    function updateHideButtonState() {
        console.log('Updating hide button state:', { 
            carrierFile: window.carrierFile, 
            secretFile: window.secretFile 
        });
        
        hideBtn.disabled = !(window.carrierFile && window.secretFile);
    }
    
    function updateExtractButtonState() {
        console.log('Updating extract button state:', { stegoFile: window.stegoFile });
        extractBtn.disabled = !window.stegoFile;
    }
    
    hideBtn.addEventListener('click', async () => {
        const quality = document.querySelector('#quality').value;
        const password = document.querySelector('#password').value;
        
        loadingOverlay.style.display = 'flex';
        
        try {
            const formData = new FormData();
            formData.append('carrier_image', window.carrierFile);
            formData.append('secret_image', window.secretFile);
            formData.append('quality', quality);
            
            if (password) {
                formData.append('password', password);
            }
            
            const response = await fetch('/api/hide', {
                method: 'POST',
                body: formData
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server responded with an error!');
            } else if (!response.ok) {
                throw new Error('Server responded with an error!');
            }
            
            const blob = await response.blob();
            
            loadingOverlay.style.display = 'none';
            
            showResultModal('Steganography Complete!', blob);
        } catch (error) {
            loadingOverlay.style.display = 'none';
            
            showErrorMessage(error.message);
            console.error('Error:', error);
        }
    });
    
    extractBtn.addEventListener('click', async () => {
        const password = document.querySelector('#extract-password').value;
        
        loadingOverlay.style.display = 'flex';
        
        try {
            const formData = new FormData();
            formData.append('stego_image', window.stegoFile);
            
            if (password) {
                formData.append('password', password);
            }
            
            const response = await fetch('/api/extract', {
                method: 'POST',
                body: formData
            });
            
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Server responded with an error!');
            } else if (!response.ok) {
                throw new Error('Server responded with an error!');
            }
            
            const blob = await response.blob();
            
            loadingOverlay.style.display = 'none';
            
            showResultModal('Hidden Image Extracted!', blob);
        } catch (error) {
            loadingOverlay.style.display = 'none';
            
            showErrorMessage(error.message);
            console.error('Error:', error);
        }
    });
    
    function showResultModal(title, blob) {
        resultTitle.textContent = title;
        window.resultBlob = blob;
        
        const url = URL.createObjectURL(blob);
        resultImage.src = url;
        
        resultModal.style.display = 'flex';
    }
    
    closeModal.addEventListener('click', () => {
        resultModal.style.display = 'none';
        URL.revokeObjectURL(resultImage.src);
    });
    
    window.addEventListener('click', (e) => {
        if (e.target === resultModal) {
            resultModal.style.display = 'none';
            URL.revokeObjectURL(resultImage.src);
        }
    });
    
    downloadResultBtn.addEventListener('click', () => {
        if (!window.resultBlob) return;
        
        const url = URL.createObjectURL(window.resultBlob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'steganograph_result.png';
        document.body.appendChild(a);
        a.click();
        
        setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 100);
    });
    
    copyResultBtn.addEventListener('click', async () => {
        if (!window.resultBlob) return;
        
        try {
            await navigator.clipboard.write([
                new ClipboardItem({
                    [window.resultBlob.type]: window.resultBlob
                })
            ]);
            
            alert('Image copied to clipboard!');
        } catch (error) {
            alert('Failed to copy to clipboard: ' + error.message);
            console.error('Copy failed:', error);
        }
    });
    
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        
        if (document.body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('darkMode', 'true');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('darkMode', 'false');
        }
    });
    
    const uploadBoxes = document.querySelectorAll('.upload-box');
    
    uploadBoxes.forEach(box => {
        box.addEventListener('dragover', (e) => {
            e.preventDefault();
            box.classList.add('dragover');
        });
        
        box.addEventListener('dragleave', () => {
            box.classList.remove('dragover');
        });
        
        box.addEventListener('drop', (e) => {
            e.preventDefault();
            box.classList.remove('dragover');
            
            const files = e.dataTransfer.files;
            if (files.length) {
                const fileInput = box.querySelector('input[type="file"]');
                fileInput.files = files;
                
                const changeEvent = new Event('change', {
                    bubbles: true
                });
                fileInput.dispatchEvent(changeEvent);
            }
        });
    });
    
    function showErrorMessage(message) {
        let errorModal = document.getElementById('error-modal');
        if (!errorModal) {
            errorModal = document.createElement('div');
            errorModal.id = 'error-modal';
            errorModal.className = 'error-modal';
            
            const modalContent = document.createElement('div');
            modalContent.className = 'modal-content error-content';
            
            const closeBtn = document.createElement('span');
            closeBtn.className = 'close-modal';
            closeBtn.innerHTML = '&times;';
            closeBtn.addEventListener('click', () => {
                errorModal.style.display = 'none';
            });
            
            const title = document.createElement('h2');
            title.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            
            const messageElement = document.createElement('p');
            messageElement.id = 'error-message';
            
            modalContent.appendChild(closeBtn);
            modalContent.appendChild(title);
            modalContent.appendChild(messageElement);
            errorModal.appendChild(modalContent);
            document.body.appendChild(errorModal);
            
            window.addEventListener('click', (e) => {
                if (e.target === errorModal) {
                    errorModal.style.display = 'none';
                }
            });
        }

        document.getElementById('error-message').textContent = message;
        
        errorModal.style.display = 'flex';
    }
}); 