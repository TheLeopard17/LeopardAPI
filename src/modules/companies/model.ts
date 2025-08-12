import { Schema, model } from 'mongoose';
const Company = new Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true }, // es. webspace
  type: { type: String, enum: ['webspace','connect','pay','rent','security'], required: true }
}, { timestamps: true });
export default model('Company', Company);
