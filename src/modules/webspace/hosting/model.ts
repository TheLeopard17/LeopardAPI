import mongoose, { Schema, InferSchemaType } from "mongoose";

const HostingSchema = new Schema({
  companyId: { type: String, index: true, required: true },
  pleskId:   { type: String, index: true, required: true },
  domain:    { type: String, index: true, required: true },
  status:    { type: String, enum: ["attivo", "sospeso", "in_attivazione", "unknown"], index: true, default: "unknown" },
  plan:      { type: String, default: null },
  phpVersion:{ type: String, default: null },
  expiresAt: { type: Date,   default: null },
  lastStatusRaw: { type: Schema.Types.Mixed, default: null },
  lastSyncAt: { type: Date, index: true, default: null },
}, { timestamps: true });

HostingSchema.index({ companyId: 1, pleskId: 1 }, { unique: true });
HostingSchema.index({ companyId: 1, domain: 1 });

export type HostingDoc = InferSchemaType<typeof HostingSchema>;
export default mongoose.model("webspace_hostings", HostingSchema);
