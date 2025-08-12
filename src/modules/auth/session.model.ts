import { Schema, model } from 'mongoose';

const Session = new Schema({
  operatorId: { type: Schema.Types.ObjectId, ref: 'Operator', index: true, required: true },
  refreshId:  { type: String, unique: true, index: true, required: true }, // jti
  refreshHash:{ type: String, required: true }, // sha256 del token
  userAgent:  { type: String },
  ip:         { type: String },
  expiresAt:  { type: Date, index: true, required: true },
  revokedAt:  { type: Date }
}, { timestamps: true });

export default model('Session', Session);
