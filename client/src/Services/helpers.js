export function capitalize(str){
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num){
  var number = parseFloat(num, 10);
  return number.toFixed(2);
}

export const dateFormat = 'MM-DD-YYYY';