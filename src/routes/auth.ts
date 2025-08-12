import { Router } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

interface User {
  username: string;
  password: string;
}

const users: User[] = [];

const router = Router();

router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }

  const existing = users.find((u) => u.username === username);
  if (existing) {
    res.status(409).json({ message: 'User already exists' });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  users.push({ username, password: hashedPassword });
  res.status(201).json({ message: 'User registered' });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find((u) => u.username === username);
  if (!username || !password) {
    res.status(400).json({ message: 'Username and password required' });
    return;
  }
  if (!user) {
    res.status(400).json({ message: 'Cannot find user' });
    return;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    res.status(403).json({ message: 'User or password incorrect' });
    return;
  }

  const secret = process.env.JWT_SECRET as string;
  const token = jwt.sign({ username: user.username }, secret, { expiresIn: '1h' });
  res.json({ token });
});

export default router;