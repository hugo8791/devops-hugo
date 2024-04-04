const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Import the express app, not starting the server here
const app = require('../app'); // Adjust the path according to your app structure

// Preparing a user's data for the test
const testUserData = { id: "testuser", name: "John Doe", age: 30 };
const userFilesDir = path.join(__dirname, 'userfiles');
const userFilePath = path.join(userFilesDir, `${testUserData.id}.txt`);

// Ensure the userfiles directory exists
if (!fs.existsSync(userFilesDir)){
  fs.mkdirSync(userFilesDir);
}

// Write a test user file
fs.writeFileSync(userFilePath, JSON.stringify(testUserData, null, 2), 'utf8');

describe('GET /user/:id', () => {
  it('responds with the user data for a given user ID', async () => {
    const response = await request(app)
      .get(`/user/${testUserData.id}`)
      .expect('Content-Type', /json/)
      .expect(200);

    // Verify the response data
    expect(response.body).toEqual(testUserData);
  });

  // Add more test cases as needed
});

// Optional: Cleanup after tests
afterAll(() => {
  // Remove the test user file
  fs.unlinkSync(userFilePath);
});
