import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import FormField from './FormField';
import ActiveUsers from './ActiveUsers';
import './CollaborativeForm.css';

const CollaborativeForm = ({ formId, user }) => {
    const [form, setForm] = useState(null);
    const [responses, setResponses] = useState({});
    const [activeUsers, setActiveUsers] = useState([]);
    const [lockedFields, setLockedFields] = useState(new Set());
    const [isConnected, setIsConnected] = useState(false);

    const socketRef = useRef(null);
    const fieldRefs = useRef({});

    useEffect(() => {
        // Initialize socket connection
        socketRef.current = io(process.env.REACT_APP_BACKEND_URL, {
            auth: {
                token: localStorage.getItem('token')
            }
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            setIsConnected(true);
            socket.emit('join-form', { formId });
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        socket.on('form-state', (data) => {
            setForm(data.form);
            setResponses(data.responses || {});
        });

        socket.on('field-updated', ({ fieldId, value, updatedBy, username }) => {
            if (updatedBy !== user.id) {
                setResponses(prev => ({
                    ...prev,
                    [fieldId]: value
                }));

                // Show update indicator
                showUpdateIndicator(fieldId, username);
            }
        });

        socket.on('field-locked', ({ fieldId, lockedBy, username }) => {
            if (lockedBy !== user.id) {
                setLockedFields(prev => new Set([...prev, fieldId]));
                showLockIndicator(fieldId, username);
            }
        });

        socket.on('field-unlocked', ({ fieldId }) => {
            setLockedFields(prev => {
                const newSet = new Set(prev);
                newSet.delete(fieldId);
                return newSet;
            });
        });

        socket.on('user-joined', ({ username }) => {
            showNotification(`${username} joined the form`);
        });

        socket.on('user-left', ({ username }) => {
            showNotification(`${username} left the form`);
        });

        socket.on('active-users', setActiveUsers);

        return () => {
            socket.emit('leave-form', { formId });
            socket.disconnect();
        };
    }, [formId, user.id]);

    const handleFieldChange = (fieldId, value, operation = null) => {
        // Optimistic update
        setResponses(prev => ({
            ...prev,
            [fieldId]: value
        }));

        // Send to server
        socketRef.current.emit('field-update', {
            formId,
            fieldId,
            value,
            operation
        });
    };

    const handleFieldFocus = (fieldId) => {
        socketRef.current.emit('field-lock', { formId, fieldId });
    };

    const handleFieldBlur = (fieldId) => {
        socketRef.current.emit('field-unlock', { formId, fieldId });
    };

    const showUpdateIndicator = (fieldId, username) => {
        const fieldElement = fieldRefs.current[fieldId];
        if (fieldElement) {
            const indicator = document.createElement('div');
            indicator.className = 'update-indicator';
            indicator.textContent = `Updated by ${username}`;
            fieldElement.appendChild(indicator);

            setTimeout(() => {
                indicator.remove();
            }, 3000);
        }
    };

    const showLockIndicator = (fieldId, username) => {
        const fieldElement = fieldRefs.current[fieldId];
        if (fieldElement) {
            fieldElement.classList.add('field-locked');
            const lockText = fieldElement.querySelector('.lock-text');
            if (lockText) {
                lockText.textContent = `Editing by ${username}`;
            }
        }
    };

    const showNotification = (message) => {
        // Simple toast notification
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    };

    if (!form) {
        return Loading form...;
    }

    return (


        { form.title }
        { form.description && { form.description } }


    { isConnected ? 'Connected' : 'Disconnected' }







    {
        form.fields.map((field) => (
            <div
                key={field.id}
                ref={el => fieldRefs.current[field.id] = el}
                className={`field-container ${lockedFields.has(field.id) ? 'locked' : ''}`}
            >
                <FormField
                    field={field}
                    value={responses[field.id] || ''}
                    onChange={(value, operation) => handleFieldChange(field.id, value, operation)}
                    onFocus={() => handleFieldFocus(field.id)}
                    onBlur={() => handleFieldBlur(field.id)}
                    disabled={lockedFields.has(field.id)}
                />
                {lockedFields.has(field.id) && (
                    Being edited...
            )}
          
        ))}



                Form Code: {form.shareCode}
                Share this code with others to collaborate


                );
};

                export default CollaborativeForm;