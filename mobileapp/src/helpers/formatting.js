export function capitalize(str) {
  if(str === 0 || str === "0.00"){
    return "0.00"
  }
  if(!str){
    return "";
  }
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num) {
  if(!num) {
    return null
  }
  return Number(parseFloat(num).toFixed(2)).toLocaleString('en', { minimumFractionDigits: 2 });
}