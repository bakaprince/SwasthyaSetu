/**
 * @fileoverview Cancellation Reason Modal Component
 * Popup modal for entering cancellation reason when admin cancels an appointment
 * @module components/modal/CancellationReasonModal
 * @author SwasthyaSetu Team
 * @version 1.0.0
 */

/**
 * Cancellation Reason Modal Class
 * Displays a popup for entering cancellation reason
 * 
 * @extends BaseModal
 * @class
 */
class CancellationReasonModal extends BaseModal {
    constructor() {
        super('cancellation-reason-modal', 'Cancel Appointment', {
            closeOnOverlayClick: false,
            closeOnEscape: true,
            size: 'md',
            zIndex: 100
        });

        /** @private */
        this.onSubmit = null;
        this.onCancel = null;
    }

    /**
     * Show the cancellation reason modal
     * 
     * @param {Function} onSubmit - Callback with reason when submitted
     * @param {Function} onCancel - Callback when cancelled
     */
    show(onSubmit, onCancel) {
        this.onSubmit = onSubmit;
        this.onCancel = onCancel;
        this.render();
        this.open();
    }

    /**
     * Render modal content
     * @private
     */
    render() {
        const bodyHTML = `
            <div class="space-y-4">
                <div class="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                    <span class="material-icons-outlined text-red-600 text-2xl">warning</span>
                    <div>
                        <p class="font-semibold text-red-800">Are you sure you want to cancel this appointment?</p>
                        <p class="text-sm text-red-600">This action cannot be undone. The patient will be notified.</p>
                    </div>
                </div>
                
                <div>
                    <label for="cancel-reason-input" class="block text-sm font-medium text-gray-700 mb-2">
                        Reason for Cancellation <span class="text-red-500">*</span>
                    </label>
                    <textarea 
                        id="cancel-reason-input"
                        rows="4"
                        class="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                        placeholder="Please provide a reason for cancellation (e.g., Doctor unavailable, Patient request, Emergency rescheduling...)"
                    ></textarea>
                    <p class="mt-1 text-xs text-gray-500">This reason will be visible to the patient.</p>
                </div>
            </div>
        `;

        const footerHTML = `
            <div class="flex justify-end gap-3">
                <button type="button" 
                        id="cancel-reason-back-btn"
                        class="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Go Back
                </button>
                <button type="button" 
                        id="cancel-reason-submit-btn"
                        class="px-6 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors inline-flex items-center gap-2">
                    <span class="material-icons-outlined text-sm">cancel</span>
                    Confirm Cancellation
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
        const footerElement = this.getFooterElement();
        if (!footerElement) return;

        // Close (X) button - explicitly handle in case parent handler isn't working
        const closeBtn = this.modalElement?.querySelector('.modal-close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                this.close();
                if (typeof this.onCancel === 'function') {
                    this.onCancel();
                }
            };
        }

        // Back button
        const backBtn = footerElement.querySelector('#cancel-reason-back-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                this.close();
                if (typeof this.onCancel === 'function') {
                    this.onCancel();
                }
            };
        }

        // Submit button
        const submitBtn = footerElement.querySelector('#cancel-reason-submit-btn');
        if (submitBtn) {
            submitBtn.onclick = () => {
                const textarea = document.getElementById('cancel-reason-input');
                const reason = textarea?.value?.trim();

                if (!reason) {
                    Helpers.showToast('Please enter a reason for cancellation', 'error');
                    textarea?.focus();
                    return;
                }

                this.close();
                if (typeof this.onSubmit === 'function') {
                    this.onSubmit(reason);
                }
            };
        }
    }
}

// Global instance
const cancellationReasonModal = new CancellationReasonModal();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CancellationReasonModal;
}
