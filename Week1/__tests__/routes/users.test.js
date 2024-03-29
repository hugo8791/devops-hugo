//const { ExpectationFailed } = require('http-errors');

const request = require('supertest');
const app = require('../../app');
const { db, client } = require('../../services/database');

describe('Get Users', () => {
  beforeEach(async () => {
    await db.collection('users').deleteMany({});
  });

  afterAll(async() => {
    client.close();
  });

  it('should get all users in array', async () => {
    const expected = { 'foo': 'bar' };
    await db.collection('users').insertOne(expected);
    delete expected._id;


    
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toEqual(1);

    
    expect(res.body[0]).toEqual(expect.objectContaining(expected));
  });
});