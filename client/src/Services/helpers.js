export function capitalize(str){
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num){
  return Number(parseFloat(num).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 });
}

export const dateFormat = 'MM-DD-YYYY';