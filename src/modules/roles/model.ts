import { Schema, model } from 'mongoose';
const Role = new Schema({
  name: { type: String, required: true },
  permissions: { type: [String], default: [] }
}, { timestamps: true });
export default model('Role', Role);
