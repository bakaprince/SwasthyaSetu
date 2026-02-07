/**
 * @fileoverview File Upload Modal Component
 * Drag-and-drop file upload popup with preview and delete functionality
 * @module components/modal/FileUploadModal
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

/**
 * File Upload Modal Class
 * Provides drag-and-drop file upload interface
 * 
 * @extends BaseModal
 * @class
 */
class FileUploadModal extends BaseModal {
    constructor() {
        super('file-upload-modal', 'Upload Document', {
            closeOnOverlayClick: true,
            closeOnEscape: true,
            size: 'md',
            zIndex: 100
        });

        /** @private */
        this.selectedFile = null;
        this.documentType = 'prescription';
        this.onUpload = null;
    }

    /**
     * Show the file upload modal
     * 
     * @param {string} documentType - Type of document (prescription, report, xray)
     * @param {Function} onUpload - Callback with file when uploaded
     */
    show(documentType, onUpload) {
        this.documentType = documentType;
        this.onUpload = onUpload;
        this.selectedFile = null;
        this.render();
        this.open();
    }

    /**
     * Get document type display name
     * @private
     */
    getDocumentTypeName() {
        const names = {
            'prescription': 'Prescription',
            'report': 'Medical Report',
            'xray': 'X-ray/MRI Scan',
            'other': 'Document'
        };
        return names[this.documentType] || 'Document';
    }

    /**
     * Render modal content
     * @private
     */
    render() {
        const bodyHTML = `
            <div class="space-y-4">
                <p class="text-sm text-gray-600">
                    Upload a <strong>${this.getDocumentTypeName()}</strong> for this appointment.
                </p>
                
                <!-- Drag and Drop Zone -->
                <div id="drop-zone" 
                     class="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all">
                    <div id="drop-zone-content">
                        <span class="material-icons-outlined text-5xl text-gray-400 mb-3">cloud_upload</span>
                        <p class="text-gray-600 font-medium">Drag & drop your file here</p>
                        <p class="text-sm text-gray-400 mt-1">or click to browse from computer</p>
                        <p class="text-xs text-gray-400 mt-3">Supported: PDF, JPG, PNG (Max 5MB)</p>
                    </div>
                    
                    <!-- File Preview (hidden initially) -->
                    <div id="file-preview" class="hidden">
                        <div class="flex items-center justify-center gap-4 p-4 bg-green-50 rounded-xl border border-green-200">
                            <span class="material-icons-outlined text-green-600 text-3xl">description</span>
                            <div class="text-left flex-1">
                                <p id="file-name" class="font-medium text-gray-900 truncate max-w-xs"></p>
                                <p id="file-size" class="text-sm text-gray-500"></p>
                            </div>
                            <button type="button" id="remove-file-btn" 
                                    class="p-2 text-red-500 hover:bg-red-100 rounded-full transition-colors">
                                <span class="material-icons-outlined">close</span>
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- Hidden file input -->
                <input type="file" id="file-input-hidden" class="hidden" accept=".pdf,.jpg,.jpeg,.png">
            </div>
        `;

        const footerHTML = `
            <div class="flex justify-end gap-3">
                <button type="button" 
                        id="upload-cancel-btn"
                        class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Cancel
                </button>
                <button type="button" 
                        id="upload-submit-btn"
                        class="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled>
                    <span class="material-icons-outlined text-sm">upload</span>
                    Upload Document
                </button>
            </div>
        `;

        this.setBody(bodyHTML);
        this.setFooter(footerHTML);
        this.attachEventListeners();
    }

    /**
     * Attach event listeners
     * @private
     */
    attachEventListeners() {
        const bodyElement = this.getBodyElement();
        const footerElement = this.getFooterElement();
        if (!bodyElement || !footerElement) return;

        const dropZone = bodyElement.querySelector('#drop-zone');
        const fileInput = bodyElement.querySelector('#file-input-hidden');
        const removeBtn = bodyElement.querySelector('#remove-file-btn');
        const cancelBtn = footerElement.querySelector('#upload-cancel-btn');
        const submitBtn = footerElement.querySelector('#upload-submit-btn');

        // Click to browse
        dropZone?.addEventListener('click', (e) => {
            if (e.target.id !== 'remove-file-btn' && !e.target.closest('#remove-file-btn')) {
                fileInput?.click();
            }
        });

        // File input change
        fileInput?.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) this.handleFileSelect(file);
        });

        // Drag and drop events
        dropZone?.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-blue-500', 'bg-blue-50');
        });

        dropZone?.addEventListener('dragleave', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
        });

        dropZone?.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-blue-500', 'bg-blue-50');
            const file = e.dataTransfer.files[0];
            if (file) this.handleFileSelect(file);
        });

        // Remove file
        removeBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.removeFile();
        });

        // Cancel button
        cancelBtn?.addEventListener('click', () => {
            this.close();
        });

        // Submit button
        submitBtn?.addEventListener('click', () => {
            if (this.selectedFile && typeof this.onUpload === 'function') {
                this.onUpload(this.selectedFile, this.documentType);
                this.close();
            }
        });
    }

    /**
     * Handle file selection
     * @param {File} file - Selected file
     * @private
     */
    handleFileSelect(file) {
        // Validate file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
            Helpers.showToast('Invalid file type. Please upload PDF or image files.', 'error');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            Helpers.showToast('File too large. Maximum size is 5MB.', 'error');
            return;
        }

        this.selectedFile = file;
        this.showFilePreview(file);
    }

    /**
     * Show file preview
     * @param {File} file - File to preview
     * @private
     */
    showFilePreview(file) {
        const bodyElement = this.getBodyElement();
        const footerElement = this.getFooterElement();
        if (!bodyElement || !footerElement) return;

        const dropContent = bodyElement.querySelector('#drop-zone-content');
        const filePreview = bodyElement.querySelector('#file-preview');
        const fileName = bodyElement.querySelector('#file-name');
        const fileSize = bodyElement.querySelector('#file-size');
        const submitBtn = footerElement.querySelector('#upload-submit-btn');

        // Hide drop content, show preview
        dropContent?.classList.add('hidden');
        filePreview?.classList.remove('hidden');

        // Set file info
        if (fileName) fileName.textContent = file.name;
        if (fileSize) fileSize.textContent = this.formatFileSize(file.size);

        // Enable submit button
        if (submitBtn) submitBtn.disabled = false;
    }

    /**
     * Remove selected file
     * @private
     */
    removeFile() {
        this.selectedFile = null;

        const bodyElement = this.getBodyElement();
        const footerElement = this.getFooterElement();
        if (!bodyElement || !footerElement) return;

        const dropContent = bodyElement.querySelector('#drop-zone-content');
        const filePreview = bodyElement.querySelector('#file-preview');
        const fileInput = bodyElement.querySelector('#file-input-hidden');
        const submitBtn = footerElement.querySelector('#upload-submit-btn');

        // Show drop content, hide preview
        dropContent?.classList.remove('hidden');
        filePreview?.classList.add('hidden');

        // Reset file input
        if (fileInput) fileInput.value = '';

        // Disable submit button
        if (submitBtn) submitBtn.disabled = true;
    }

    /**
     * Format file size
     * @param {number} bytes - File size in bytes
     * @returns {string} Formatted size
     * @private
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Global instance
const fileUploadModal = new FileUploadModal();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileUploadModal;
}
