import { renderDashboard } from './src/pages/Dashboard.js';
import { initStore, setCurrentUser, getMembers } from './src/data/store.js';

initStore();
setCurrentUser(getMembers()[0]);
console.log("Rendering dashboard...");
const html = renderDashboard();
console.log("Dashboard rendered ok. Length:", html.length);
