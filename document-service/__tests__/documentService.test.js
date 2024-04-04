const request = require('supertest');
const app = require('../app'); // Make sure to export your Express app, e.g., module.exports = app;
const fs = require('fs');

describe('GET /user/:id', () => {
  it('responds with json containing a single user if the user exists', async () => {
    // Mock fs.existsSync to return true to simulate that the user file exists
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    
    // Mock fs.readFile to call the callback with null error and a stringified JSON of the user data
    jest.spyOn(fs, 'readFile').mockImplementation((path, enc, callback) => {
      callback(null, JSON.stringify({ id: '123', name: 'John Doe' }));
    });

    const response = await request(app).get('/user/123');
    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ id: '123', name: 'John Doe' });
    expect(response.type).toBe('application/json');
  });

  it('responds with 404 if the user does not exist', async () => {
    // Mock fs.existsSync to return false to simulate that the user file does not exist
    jest.spyOn(fs, 'existsSync').mockReturnValue(false);

    const response = await request(app).get('/user/999');
    expect(response.statusCode).toBe(404);
    expect(response.text).toEqual('User not found');
  });
});
