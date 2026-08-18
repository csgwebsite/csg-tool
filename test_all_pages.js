global.window = { location: { hash: '' } };

import { renderTasks } from './src/pages/Tasks.js';
import { renderMembers } from './src/pages/Members.js';
import { renderProjects } from './src/pages/Projects.js';
import { renderData } from './src/pages/Data.js';
import { initStore, setCurrentUser, getMembers } from './src/data/store.js';

initStore();
setCurrentUser(getMembers()[0]);

console.log("Rendering Tasks...");
console.log("Tasks length:", renderTasks().length);

console.log("Rendering Members...");
console.log("Members length:", renderMembers().length);

console.log("Rendering Projects...");
console.log("Projects length:", renderProjects().length);

console.log("Rendering Data...");
console.log("Data length:", renderData()?.length || 0);

