import { initStore, getCurrentUser, setCurrentUser, getMembers } from './src/data/store.js';

initStore();
const members = getMembers();
console.log("Found members:", members.length);
if(members.length > 0) {
  setCurrentUser(members[0]);
  console.log("Current user:", getCurrentUser()?.fullName);
}
