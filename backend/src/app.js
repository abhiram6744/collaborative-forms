import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

function App() {
  const [code, setCode] = useState('');
  const [form, setForm] = useState(null);
  const [response, setResponse] = useState({});

  const joinForm = async () => {
    const res = await axios.post('http://localhost:5000/api/forms/join', { code });
    setForm(res.data);
    setResponse(res.data.response || {});
    socket.emit('join-form', code);
  };

  const updateField = (fieldId, value) => {
    const newResponse = { ...response, [fieldId]: value };
    setResponse(newResponse);
    socket.emit('field-update', { code, updates: { [fieldId]: value } });
    axios.put(`http://localhost:5000/api/forms/update/${code}`, { updates: { [fieldId]: value } });
  };

  useEffect(() => {
    socket.on('field-update', (updates) => {
      setResponse(prev => ({ ...prev, ...updates }));
    });
  }, []);

  if (!form) return (
    <div>
      <h2>Join Form</h2>
      <input value={code} onChange={e => setCode(e.target.value)} placeholder="Enter Code" />
      <button onClick={joinForm}>Join</button>
    </div>
  );

  return (
    <div>
      <h2>{form.title}</h2>
      {form.fields.map((field, idx) => (
        <div key={idx}>
          <label>{field.label}</label>
          {field.type === 'dropdown' ? (
            <select value={response[field.label] || ''} onChange={e => updateField(field.label, e.target.value)}>
              <option value="">-- select --</option>
              {field.options.map((opt, i) => (
                <option key={i} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <input
              type={field.type}
              value={response[field.label] || ''}
              onChange={e => updateField(field.label, e.target.value)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default App;
