import mongoose from 'mongoose';
import crypto from 'node:crypto';

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  leetcodeUsername: { type: String, default: null },
  refreshTokenHash: { type: String, default: null },
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  notificationPreferences: {
    email: { type: String, default: null },
    dailyReminderEnabled: { type: Boolean, default: true },
    potdReminderEnabled: { type: Boolean, default: true },
    contestAlertEnabled: { type: Boolean, default: true },
    reminderTime: { type: String, default: '19:00' }, // HH:MM 24hr format
    timezone: { type: String, default: 'Asia/Kolkata' }
  }
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
    this.notificationPreferences = {
      email: data.notificationPreferences?.email !== undefined ? data.notificationPreferences.email : null,
      dailyReminderEnabled: data.notificationPreferences?.dailyReminderEnabled !== undefined ? data.notificationPreferences.dailyReminderEnabled : true,
      potdReminderEnabled: data.notificationPreferences?.potdReminderEnabled !== undefined ? data.notificationPreferences.potdReminderEnabled : true,
      contestAlertEnabled: data.notificationPreferences?.contestAlertEnabled !== undefined ? data.notificationPreferences.contestAlertEnabled : true,
      reminderTime: data.notificationPreferences?.reminderTime || '19:00',
      timezone: data.notificationPreferences?.timezone || 'Asia/Kolkata'
    };
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
        let userVal;
        if (key.includes('.')) {
          userVal = key.split('.').reduce((acc, part) => acc?.[part], user);
        } else {
          userVal = user[key];
        }
        if (userVal !== val) {
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
      for (const [key, val] of Object.entries(query)) {
        let userVal;
        if (key.includes('.')) {
          userVal = key.split('.').reduce((acc, part) => acc?.[part], user);
        } else {
          userVal = user[key];
        }

        if (val && typeof val === 'object' && val.$ne !== undefined) {
          if (userVal === val.$ne) match = false;
        } else if (val !== undefined && userVal !== val) {
          match = false;
        }
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

    const applyUpdates = (source) => {
      for (const [key, val] of Object.entries(source)) {
        if (key.includes('.')) {
          const parts = key.split('.');
          let target = user;
          for (let i = 0; i < parts.length - 1; i++) {
            if (!target[parts[i]]) target[parts[i]] = {};
            target = target[parts[i]];
          }
          target[parts[parts.length - 1]] = val;
        } else {
          user[key] = val;
        }
      }
    };

    if (update.$set) {
      applyUpdates(update.$set);
    } else {
      applyUpdates(update);
    }

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
