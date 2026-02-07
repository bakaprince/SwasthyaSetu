/**
 * @fileoverview Base Modal Component
 * Reusable modal component providing common modal functionality
 * All specific modals should extend this base class
 * @module components/modal/BaseModal
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

/**
 * Base Modal Class
 * Provides core modal functionality: open, close, render, event handling
 * 
 * @class
 * @example
 * class MyModal extends BaseModal {
 *   constructor() {
 *     super('my-modal-id', 'My Modal Title');
 *   }
 * }
 */
class BaseModal {
    /**
     * Create a base modal instance
     * 
     * @param {string} modalId - Unique identifier for the modal
     * @param {string} title - Modal title
     * @param {Object} options - Modal configuration options
     * @param {boolean} options.closeOnOverlayClick - Close modal when clicking overlay (default: true)
     * @param {boolean} options.closeOnEscape - Close modal on ESC key press (default: true)
     * @param {string} options.size - Modal size: 'sm', 'md', 'lg', 'xl' (default: 'lg')
     */
    constructor(modalId, title = '', options = {}) {
        /** @private */
        this.modalId = modalId;

        /** @private */
        this.title = title;

        /** @private */
        this.options = {
            closeOnOverlayClick: options.closeOnOverlayClick ?? true,
            closeOnEscape: options.closeOnEscape ?? true,
            size: options.size || 'lg',
            zIndex: options.zIndex || 50
        };

        /** @private */
        this.modalElement = null;

        /** @private */
        this.isOpen = false;

        /**
         * Callback function called when modal opens
         * @type {Function|null}
         */
        this.onOpen = null;

        /**
         * Callback function called when modal closes
         * @type {Function|null}
         */
        this.onClose = null;

        // Initialize modal DOM structure
        this.createModalElement();
        this.attachEventListeners();
    }

    /**
     * Create modal DOM element and add to document
     * 
     * @private
     */
    createModalElement() {
        // Check if modal already exists
        if (document.getElementById(this.modalId)) {
            this.modalElement = document.getElementById(this.modalId);
            return;
        }

        // Create modal container
        const modal = document.createElement('div');
        modal.id = this.modalId;
        modal.className = 'fixed inset-0 hidden overflow-y-auto';
        modal.style.zIndex = this.options.zIndex;
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', `${this.modalId}-title`);

        // Get size class
        const sizeClasses = {
            sm: 'max-w-md',
            md: 'max-w-2xl',
            lg: 'max-w-4xl',
            xl: 'max-w-6xl'
        };
        const sizeClass = sizeClasses[this.options.size] || sizeClasses.lg;

        modal.innerHTML = `
            <!-- Overlay -->
            <div class="modal-overlay fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"></div>
            
            <!-- Modal Container -->
            <div class="flex min-h-screen items-center justify-center p-4">
                <!-- Modal Content -->
                <div class="modal-content relative w-full ${sizeClass} transform rounded-2xl bg-white shadow-2xl transition-all">
                    <!-- Header -->
                    <div class="modal-header flex items-center justify-between border-b border-gray-200 px-6 py-4">
                        <h3 id="${this.modalId}-title" class="modal-title text-xl font-bold text-gray-900">
                            ${this.title}
                        </h3>
                        <button type="button" 
                                class="modal-close-btn rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
                                aria-label="Close modal">
                            <span class="material-icons-outlined">close</span>
                        </button>
                    </div>
                    
                    <!-- Body -->
                    <div class="modal-body overflow-y-auto max-h-[70vh] px-6 py-4">
                        <!-- Content will be injected here -->
                    </div>
                    
                    <!-- Footer (optional) -->
                    <div class="modal-footer hidden border-t border-gray-200 px-6 py-4">
                        <!-- Footer content will be injected here -->
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        this.modalElement = modal;
    }

    /**
     * Attach event listeners to modal elements
     * 
     * @private
     */
    attachEventListeners() {
        if (!this.modalElement) return;

        // Close button
        const closeBtn = this.modalElement.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        // Overlay click
        if (this.options.closeOnOverlayClick) {
            const overlay = this.modalElement.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', () => this.close());
            }
        }

        // ESC key
        if (this.options.closeOnEscape) {
            this.escKeyHandler = (e) => {
                if (e.key === 'Escape' && this.isOpen) {
                    this.close();
                }
            };
            document.addEventListener('keydown', this.escKeyHandler);
        }
    }

    /**
     * Open the modal
     * Adds show animation and prevents body scroll
     * 
     * @public
     * @returns {void}
     * @example
     * modal.open();
     */
    open() {
        if (!this.modalElement || this.isOpen) return;

        // Show modal
        this.modalElement.classList.remove('hidden');

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        // Animation delay
        setTimeout(() => {
            this.modalElement.querySelector('.modal-overlay')?.classList.add('opacity-100');
            this.modalElement.querySelector('.modal-content')?.classList.add('scale-100');
        }, 10);

        this.isOpen = true;

        // Call onOpen callback
        if (typeof this.onOpen === 'function') {
            this.onOpen();
        }

        console.log(`[BaseModal] Opened modal: ${this.modalId}`);
    }

    /**
     * Close the modal
     * Adds hide animation and restores body scroll
     * 
     * @public
     * @returns {void}
     * @example
     * modal.close();
     */
    close() {
        if (!this.modalElement || !this.isOpen) return;

        // Fade out animation
        this.modalElement.querySelector('.modal-overlay')?.classList.remove('opacity-100');
        this.modalElement.querySelector('.modal-content')?.classList.remove('scale-100');

        // Hide modal after animation
        setTimeout(() => {
            this.modalElement.classList.add('hidden');
            document.body.style.overflow = '';
            this.isOpen = false;

            // Call onClose callback
            if (typeof this.onClose === 'function') {
                this.onClose();
            }
        }, UI_CONFIG.MODAL_TRANSITION_DURATION);

        console.log(`[BaseModal] Closed modal: ${this.modalId}`);
    }

    /**
     * Set modal title
     * 
     * @param {string} newTitle - New title text
     * @public
     * @example
     * modal.setTitle('Updated Title');
     */
    setTitle(newTitle) {
        this.title = newTitle;
        const titleElement = this.modalElement?.querySelector('.modal-title');
        if (titleElement) {
            titleElement.textContent = newTitle;
        }
    }

    /**
     * Set modal body content
     * 
     * @param {string|HTMLElement} content - HTML string or DOM element
     * @public
     * @example
     * modal.setBody('<p>Hello World</p>');
     */
    setBody(content) {
        const bodyElement = this.modalElement?.querySelector('.modal-body');
        if (!bodyElement) return;

        if (typeof content === 'string') {
            bodyElement.innerHTML = content;
        } else if (content instanceof HTMLElement) {
            bodyElement.innerHTML = '';
            bodyElement.appendChild(content);
        }
    }

    /**
     * Set modal footer content
     * Shows footer if content provided, hides if null
     * 
     * @param {string|HTMLElement|null} content - Footer content or null to hide
     * @public
     * @example
     * modal.setFooter('<button>Save</button>');
     */
    setFooter(content) {
        const footerElement = this.modalElement?.querySelector('.modal-footer');
        if (!footerElement) return;

        if (content === null) {
            footerElement.classList.add('hidden');
        } else {
            footerElement.classList.remove('hidden');

            if (typeof content === 'string') {
                footerElement.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                footerElement.innerHTML = '';
                footerElement.appendChild(content);
            }
        }
    }

    /**
     * Get modal body element
     * 
     * @returns {HTMLElement|null} Body element
     * @public
     */
    getBodyElement() {
        return this.modalElement?.querySelector('.modal-body');
    }

    /**
     * Get modal footer element
     * 
     * @returns {HTMLElement|null} Footer element
     * @public
     */
    getFooterElement() {
        return this.modalElement?.querySelector('.modal-footer');
    }

    /**
     * Destroy the modal
     * Removes from DOM and cleans up event listeners
     * 
     * @public
     */
    destroy() {
        // Remove ESC key handler
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
        }

        // Remove modal element
        if (this.modalElement) {
            this.modalElement.remove();
            this.modalElement = null;
        }

        this.isOpen = false;
        console.log(`[BaseModal] Destroyed modal: ${this.modalId}`);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseModal;
}
