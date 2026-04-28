import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, enum: ['venue', 'catering', 'decoration', 'photography', 'entertainment'], required: true },
  price: { type: Number, required: true },
  description: { type: String },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

export const Service = mongoose.model('Service', serviceSchema);
