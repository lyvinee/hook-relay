import React from 'react';
import { navigations } from '../config/navigation';
import { useNavigate } from 'react-router';

interface WebhookSuccessModalProps {
    isOpen: boolean;
    secret: string;
    onClose: () => void;
}

const WebhookSuccessModal: React.FC<WebhookSuccessModalProps> = ({
    isOpen,
    secret,
    onClose,
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(secret);
    };

    const handleClose = () => {
        onClose();
        navigate(navigations.webhooks);
    };

    return (
        <dialog className="modal modal-open">
            <div className="modal-box">
                <h3 className="font-bold text-lg text-success">Webhook Created Successfully!</h3>
                <p className="py-4">
                    Here is your webhook signing secret. <br />
                    <span className="font-bold text-error">
                        Please save this secret now, as it will not be shown again.
                    </span>
                </p>

                <div className="form-control">
                    <div className="input-group flex">
                        <input
                            type="text"
                            value={secret}
                            readOnly
                            className="input input-bordered w-full"
                        />
                        <button className="btn btn-square" onClick={handleCopy} title="Copy to clipboard">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" /></svg>
                        </button>
                    </div>
                </div>

                <div className="modal-action">
                    <button className="btn btn-primary" onClick={handleClose}>
                        Okay
                    </button>
                </div>
            </div>
        </dialog>
    );
};

export default WebhookSuccessModal;
