import React, { useState } from 'react';
import { Plus, Trash2, GripVertical, Save } from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './FormBuilder.css';

const FormBuilder = ({ onSave, initialForm = null }) => {
    const [form, setForm] = useState(initialForm || {
        title: '',
        description: '',
        fields: []
    });

    const fieldTypes = [
        { value: 'text', label: 'Text Input' },
        { value: 'email', label: 'Email' },
        { value: 'number', label: 'Number' },
        { value: 'textarea', label: 'Text Area' },
        { value: 'select', label: 'Dropdown' },
        { value: 'radio', label: 'Radio Buttons' },
        { value: 'checkbox', label: 'Checkboxes' }
    ];

    const addField = (type) => {
        const newField = {
            id: `field_${Date.now()}`,
            type,
            label: `New ${type} field`,
            description: '',
            required: false,
            placeholder: '',
            options: type === 'select' || type === 'radio' || type === 'checkbox'
                ? [{ value: 'option1', label: 'Option 1' }]
                : undefined
        };

        setForm(prev => ({
            ...prev,
            fields: [...prev.fields, newField]
        }));
    };

    const updateField = (fieldId, updates) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.map(field =>
                field.id === fieldId ? { ...field, ...updates } : field
            )
        }));
    };

    const removeField = (fieldId) => {
        setForm(prev => ({
            ...prev,
            fields: prev.fields.filter(field => field.id !== fieldId)
        }));
    };

    const addOption = (fieldId) => {
        const field = form.fields.find(f => f.id === fieldId);
        const newOptionNum = (field.options?.length || 0) + 1;

        updateField(fieldId, {
            options: [
                ...(field.options || []),
                { value: `option${newOptionNum}`, label: `Option ${newOptionNum}` }
            ]
        });
    };

    const updateOption = (fieldId, optionIndex, updates) => {
        const field = form.fields.find(f => f.id === fieldId);
        const updatedOptions = field.options.map((option, index) =>
            index === optionIndex ? { ...option, ...updates } : option
        );

        updateField(fieldId, { options: updatedOptions });
    };

    const removeOption = (fieldId, optionIndex) => {
        const field = form.fields.find(f => f.id === fieldId);
        const updatedOptions = field.options.filter((_, index) => index !== optionIndex);

        updateField(fieldId, { options: updatedOptions });
    };

    const handleDragEnd = (result) => {
        if (!result.destination) return;

        const newFields = Array.from(form.fields);
        const [reorderedField] = newFields.splice(result.source.index, 1);
        newFields.splice(result.destination.index, 0, reorderedField);

        setForm(prev => ({ ...prev, fields: newFields }));
    };

    const handleSave = () => {
        if (!form.title.trim()) {
            alert('Please enter a form title');
            return;
        }

        if (form.fields.length === 0) {
            alert('Please add at least one field');
            return;
        }

        onSave(form);
    };

    return (


        { initialForm? 'Edit Form': 'Create New Form' }
        
          
          Save Form
        
      

      
        
          Form Title *
        <input
            type="text"
            value={form.title}
            onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
            placeholder="Enter form title..."
        />



    Description
        < textarea
    value = { form.description }
    onChange = {(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
placeholder = "Enter form description..."
rows = { 3}
    />




    Add Fields

{
    fieldTypes.map(type => (
        <button
            key={type.value}
            onClick={() => addField(type.value)}
            className="field-type-btn"
        >

            {type.label}
            
          ))}





            {(provided) => (

                {
                    form.fields.map((field, index) => (

                        {(provided) => (






            {fieldTypes.find(t => t.value === field.type)?.label}

            <button
                onClick={() => removeField(field.id)}
                className="remove-field-btn"
            >






                Label *
                <input
                    type="text"
                    value={field.label}
                    onChange={(e) => updateField(field.id, { label: e.target.value })}
                />



                Description
                <input
                    type="text"
                    value={field.description}
                    onChange={(e) => updateField(field.id, { description: e.target.value })}
                    placeholder="Optional field description..."
                />


                {(field.type === 'text' || field.type === 'email' || field.type === 'textarea') && (

                    Placeholder
                    < input
                              type="text"
                value={field.placeholder}
                onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
                placeholder="Enter placeholder text..."
                            />
                          
                        )}



                <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                Required field



                {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (


                    Options
                    < button
                                onClick={() => addOption(field.id)}
                className="add-option-btn"
                              >

                Add Option



                {field.options?.map((option, optionIndex) => (
                              
                                <input
                                  type="text"
                                  value={option.value}
                                  onChange={(e) => updateOption(field.id, optionIndex, { value: e.target.value })}
                                  placeholder="Option value"
                                />
                                <input
                                  type="text"
                                  value={option.label}
                                  onChange={(e) => updateOption(field.id, optionIndex, { label: e.target.value })}
                                  placeholder="Option label"
                                />
                                {
                        field.options.length > 1 && (
                            <button
                                onClick={() => removeOption(field.id, optionIndex)}
                                className="remove-option-btn"
                            >
                                    
                                  
                                )}
                              
                            ))}
                          
                        )}
                      
                    
                  )}
                
              ))}
                                {provided.placeholder}
            
          )}



                                {form.fields.length === 0 && (

                                    No fields added yet. Click on the field types above to start building your form.
        
      )}

                                );
};

                                export default FormBuilder;