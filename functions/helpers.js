import fs from 'fs';
export function checkPermission(userId) {
  const allowedUsers = process.env.ALLOWED_USERS.split(',');
  return allowedUsers.includes(userId);
}
export function loadData(file) {
  return JSON.parse(fs.readFileSync(`./data/${file}.json`, 'utf8'));
}
export function saveData(file, data) {
  fs.writeFileSync(`./data/${file}.json`, JSON.stringify(data, null, 2));
}
export function formatTime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
}