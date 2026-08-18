const fs = require('fs');

function parseDate(dStr) {
  if (!dStr || dStr.trim() === '') return '';
  const parts = dStr.trim().split('/');
  if (parts.length === 3) return \`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}\`;
  if (parts.length === 2) return \`${parts[1]}-${parts[0].padStart(2, '0')}-01\`;
  return dStr;
}

const rawData = [
  ... (Wait, writing string output instead of doing node execution)
