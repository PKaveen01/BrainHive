// hooks/useCustomPrompt.js
import { useState, useCallback } from 'react';

export const useCustomPrompt = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({
        title: '',
        message: '',
        defaultValue: '',
        placeholder: '',
        unit: '',
        onConfirm: null,
        onCancel: null
    });

    const showPrompt = useCallback((options) => {
        return new Promise((resolve) => {
            setConfig({
                title: options.title || 'Enter Value',
                message: options.message || '',
                defaultValue: options.defaultValue || '',
                placeholder: options.placeholder || '',
                unit: options.unit || '',
                onConfirm: (value) => {
                    resolve(value);
                    setIsOpen(false);
                },
                onCancel: () => {
                    resolve(null);
                    setIsOpen(false);
                }
            });
            setIsOpen(true);
        });
    }, []);

    const PromptDialog = () => {
        if (!isOpen) return null;

        const [value, setValue] = useState(config.defaultValue);

        const handleConfirm = () => {
            if (config.onConfirm) {
                config.onConfirm(value);
            }
        };

        const handleCancel = () => {
            if (config.onCancel) {
                config.onCancel();
            }
        };

        return (
            <div className="prompt-dialog-overlay" onClick={handleCancel}>
                <div className="prompt-dialog" onClick={(e) => e.stopPropagation()}>
                    <div className="prompt-dialog-header">
                        <div className="prompt-dialog-icon">
                            ⚠️
                        </div>
                        <div>
                            <h3>{config.title}</h3>
                            {config.message && <p>{config.message}</p>}
                        </div>
                    </div>
                    <div className="prompt-dialog-body">
                        <div className="prompt-input-group">
                            <label>Duration</label>
                            <div className="prompt-input-wrapper">
                                <span className="prompt-input-icon">📅</span>
                                <input
                                    type="number"
                                    className="prompt-input"
                                    value={value}
                                    onChange={(e) => setValue(e.target.value)}
                                    placeholder={config.placeholder || "Enter number of days"}
                                    min="1"
                                    autoFocus
                                />
                                {config.unit && <span className="prompt-input-unit">{config.unit}</span>}
                            </div>
                            <div className="prompt-hint">
                                <span>ℹ️</span>
                                <span>User will not be able to access their account during this period</span>
                            </div>
                            <div className="prompt-hint">
                                <span>⚠️</span>
                                <span>This action can be reversed by reactivating the user</span>
                            </div>
                        </div>
                    </div>
                    <div className="prompt-dialog-footer">
                        <button className="prompt-btn prompt-btn-cancel" onClick={handleCancel}>
                            Cancel
                        </button>
                        <button className="prompt-btn prompt-btn-confirm" onClick={handleConfirm}>
                            Confirm Suspension
                        </button>
                    </div>
                </div>
            </div>
        );
    };

    return { showPrompt, PromptDialog };
};