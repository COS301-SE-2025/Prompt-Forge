const mockApiResponse = (status, data) => {
    return Promise.resolve({
        status,
        json: () => Promise.resolve(data),
    });
};

const mockFetch = jest.fn((url) => {
    if (url.includes('openrouter')) {
        return mockApiResponse(200, { choices: [{ message: 'Mock response' }] });
    }
    return mockApiResponse(404, { error: 'Not Found' });
});

const mockReadableStream = () => {
    return {
        getReader: jest.fn(() => ({
            read: jest.fn(() => Promise.resolve({ done: false, value: new Uint8Array([1, 2, 3]) })),
        })),
    };
};

export { mockFetch, mockReadableStream };