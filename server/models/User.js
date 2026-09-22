import mongoose from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  leetcodeUsername: { type: String, default: null },
  refreshTokenHash: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.model('User', userSchema);

// In-memory fallback store when MongoDB is not yet connected
const memoryStore = new Map();

class MemoryUserDoc {
  constructor(data) {
    this._id = data._id || crypto.randomBytes(12).toString('hex');
    this.googleId = data.googleId;
    this.email = data.email;
    this.name = data.name;
    this.leetcodeUsername = data.leetcodeUsername || null;
    this.refreshTokenHash = data.refreshTokenHash || null;
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.createdAt = data.createdAt || new Date();
  }

  async save() {
    memoryStore.set(this._id.toString(), this);
    return this;
  }
}

const User = {
  schema: userSchema,

  async findOne(query) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findOne(query);
    }
    for (const user of memoryStore.values()) {
      let match = true;
      for (const [key, val] of Object.entries(query)) {
        if (user[key] !== val) {
          match = false;
          break;
        }
      }
      if (match) return user;
    }
    return null;
  },

  async findById(id) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findById(id);
    }
    return memoryStore.get(id ? id.toString() : '') || null;
  },

  async find(query = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.find(query);
    }
    const results = [];
    for (const user of memoryStore.values()) {
      let match = true;
      if (query.isActive !== undefined && user.isActive !== query.isActive) match = false;
      if (query.refreshTokenHash && query.refreshTokenHash.$ne !== undefined) {
        if (user.refreshTokenHash === query.refreshTokenHash.$ne) match = false;
      }
      if (match) results.push(user);
    }
    return results;
  },

  async findByIdAndUpdate(id, update, options = {}) {
    if (mongoose.connection.readyState === 1) {
      return MongooseUser.findByIdAndUpdate(id, update, options);
    }
    const user = memoryStore.get(id ? id.toString() : '');
    if (!user) return null;
    Object.assign(user, update);
    memoryStore.set(id.toString(), user);
    return user;
  },

  // Constructor emulation: new User(data)
  createInstance(data) {
    if (mongoose.connection.readyState === 1) {
      return new MongooseUser(data);
    }
    return new MemoryUserDoc(data);
  }
};

// Allow `new User(...)` syntax
function UserConstructor(data) {
  return User.createInstance(data);
}
Object.setPrototypeOf(UserConstructor, User);

export default UserConstructor;
