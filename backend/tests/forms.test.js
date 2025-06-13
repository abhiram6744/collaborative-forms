test('should create form as admin', async () => {
    const formData = {
        title: 'Feedback Form',
        description: 'Simple feedback form',
        fields: [
            {
                id: 'name',
                type: 'text',
                label: 'Full Name',
                required: true,
                placeholder: 'Enter your name'
            },
            {
                id: 'rating',
                type: 'select',
                label: 'Rating',
                required: true,
                options: [
                    { value: '5', label: 'Excellent' },
                    { value: '4', label: 'Good' },
                    { value: '3', label: 'Average' },
                    { value: '2', label: 'Poor' },
                    { value: '1', label: 'Very Poor' }
                ]
            }
        ]
    };

    const response = await request(app)
        .post('/api/forms')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(formData);

    expect(response.statusCode).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Feedback Form');
});
