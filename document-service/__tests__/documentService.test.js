const request = require('supertest');
const express = require('express');
const fs = require('fs');
const path = require('path');

// Mock the services to prevent actual DB and file system interaction
jest.mock('fs');
jest.mock('./services/database', () => ({
  db: {
    collection: () => ({
      insertOne: jest.fn().mockResolvedValue({}),
    }),
  },
}));

// Mock AMQP to prevent actual connection attempts
jest.mock('amqplib', () => ({
  connect: jest.fn().mockResolvedValue({
    createChannel: jest.fn().mockResolvedValue({
      assertExchange: jest.fn().mockResolvedValue({}),
      assertQueue: jest.fn().mockResolvedValue({ queue: 'userAddedQueue' }),
      bindQueue: jest.fn().mockResolvedValue({}),
      consume: jest.fn().mockResolvedValue({}),
    }),
  }),
}));

const app = require('./app'); // Adjust the path as necessary

describe('App Endpoints', () => {
  beforeEach(() => {
    // Mock fs.existsSync for specific tests
    fs.existsSync.mockImplementation((path) => path.includes('userfiles'));
  });

  it('GET / - responds with Hello World!', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(200);
    expect(response.text).toBe('Hello World!');
  });

  describe('GET /user/:id', () => {
    it('responds with user data for existing user', async () => {
      const mockUserData = { id: '1', name: 'Test User' };
      fs.readFile.mockImplementation((path, encoding, callback) => {
        callback(null, JSON.stringify(mockUserData));
      });

      const response = await request(app).get('/user/1');
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockUserData);
    });

    it('responds with 404 for non-existing user', async () => {
      fs.existsSync.mockReturnValue(false);

      const response = await request(app).get('/user/nonexistent');
      expect(response.statusCode).toBe(404);
    });
  });
});