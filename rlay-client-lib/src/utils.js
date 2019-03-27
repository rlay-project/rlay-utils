const capitalizeFirstLetter = (string) => {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const generateFnName = (string) => {
  if (string.endsWith('Class')) return capitalizeFirstLetter(string.slice(0, -5));
  if (string.endsWith('DataProperty')) return capitalizeFirstLetter(string.slice(0, -12));
  if (string.endsWith('ObjectProperty')) return capitalizeFirstLetter(string.slice(0, -14));
  return string;
}

module.exports = {
  generateFnName,
  capitalizeFirstLetter,
};
