import { Schema, model, Types } from 'mongoose';
export type OperatorStatus = 'verified'|'blocked'|'suspended'|'pending';

const RoleBinding = new Schema({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  roleId:    { type: Schema.Types.ObjectId, ref: 'Role', required: true }
}, { _id: false });

const Operator = new Schema({
  operatorCode: { type: String, unique: true, index: true, required: true },
  pinHash:      { type: String, required: true },
  name:         { type: String, required: true },
  status:       { type: String, enum: ['verified','blocked','suspended','pending'], default: 'pending' },
  roles:        { type: [RoleBinding], default: [] }
}, { timestamps: true });

export default model('Operator', Operator);
