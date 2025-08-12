import argon2 from 'argon2';
export async function hashPin(pin: string) { return argon2.hash(pin, { type: argon2.argon2id }); }
export async function verifyPin(hash: string, pin: string) { return argon2.verify(hash, pin); }
