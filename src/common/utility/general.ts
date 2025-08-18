export const toTitleCase = (str: string) => {
  return str
    .toLowerCase() // first make everything lowercase
    .replace(/\b\w/g, char => char.toUpperCase()); // capitalize first letter of each word
};
