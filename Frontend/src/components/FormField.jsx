import React, { useState, useRef, useEffect } from 'react';

const FormField = ({ field, value, onChange, onFocus, onBlur, disabled }) => {
    const [localValue, setLocalValue] = useState(value);
    const [cursorPosition, setCursorPosition] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    const handleChange = (e) => {
        const newValue = e.target.value;
        const cursor = e.target.selectionStart;

        setLocalValue(newValue);
        setCursorPosition(cursor);

        // Create operation for text fields to support operational transform
        const operation = field.type === 'text' || field.type === 'textarea' ? {
            type: 'text-insert',
            position: cursor,
            insert: newValue.substring(cursor - 1, cursor),
            delete: 0
        } : null;

        onChange(newValue, operation);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            const cursor = e.target.selectionStart;
            const operation = {
                type: 'text-delete',
                position: cursor,
                delete: 1
            };

            // Will be handled by onChange after the deletion
        }
    };

    const renderField = () => {
        const commonProps = {
            ref: inputRef,
            value: localValue,
            onChange: handleChange,
            onFocus,
            onBlur,
            onKeyDown: handleKeyDown,
            disabled,
            className: `form-input ${disabled ? 'disabled' : ''}`,
            placeholder: field.placeholder || `Enter ${field.label}...`
        };

        switch (field.type) {
            case 'text':
                return;

            case 'email':
                return;

            case 'number':
                return;

            case 'textarea':
                return (
          
        );

            case 'select':
                return (

                    Select an option...
                {
                    field.options?.map((option, index) => (

                        { option.label }

                    ))
                }
          
        );
      
      case 'radio':
return (

    {
        field.options?.map((option, index) => (

            <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={localValue === option.value}
                onChange={handleChange}
                disabled={disabled}
            />
                { option.label }

        ))
    }

);
      
      case 'checkbox':
return (

    {
        field.options?.map((option, index) => (

            <input
                type="checkbox"
                value={option.value}
                checked={Array.isArray(localValue) && localValue.includes(option.value)}
                onChange={(e) => {
                    const currentValues = Array.isArray(localValue) ? localValue : [];
                    const newValues = e.target.checked
                        ? [...currentValues, option.value]
                        : currentValues.filter(v => v !== option.value);
                    onChange(newValues);
                }}
                disabled={disabled}
            />
                { option.label }

        ))
    }

);
      
      default:
return;
    }
  };

return (


    { field.label }
        { field.required && *}

{
    field.description && (
        { field.description }
    )
}
{ renderField() }
    
  );
};

export default FormField;