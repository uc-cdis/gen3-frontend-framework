// separate function for hashing logic
function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
}

// hash function for a string
export function hashCode(str: string) {
  if (str === null || str === '') {
    return 0;
  }
  return hashString(str);
}
