global.window = {
  location: { hash: '' },
  addEventListener: () => {}
};
global.document = {
  getElementById: () => ({ innerHTML: '', className: '', style: {} }),
  documentElement: { setAttribute: () => {} }
};

import './src/main.js';
console.log("Main loaded");
import { getCurrentUser } from './src/data/store.js';
console.log("User:", getCurrentUser()?.fullName);
