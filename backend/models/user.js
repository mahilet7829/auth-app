import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String, default: '' },
  countryCode: { type: String, default: '+251' },
  location: { type: String, default: '' },
  birthdate: { type: Date, required: true },
  password: { type: String, required: true },
  googleId: { type: String },
  picture: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }],
  resetPasswordToken: { type: String },
  resetPasswordExpires: { type: Date },
  isEmailVerified: { type: Boolean, default: true }, // Set to true by default to skip email verification
  createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('User', userSchema);