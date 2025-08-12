import express from 'express';
import request from 'supertest';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import authRouter from '../src/routes/auth';

const app = express();
app.use(express.json());
app.use('/auth', authRouter);

test('POST /auth/login requires username', async () => {
  const res = await request(app).post('/auth/login').send({ password: 'secret' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { message: 'Username and password required' });
});

test('POST /auth/login requires password', async () => {
  const res = await request(app).post('/auth/login').send({ username: 'john', password: '' });
  assert.equal(res.status, 400);
  assert.deepEqual(res.body, { message: 'Username and password required' });
});