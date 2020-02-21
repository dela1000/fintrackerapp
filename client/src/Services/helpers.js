export function capitalize(str){
  return str.toLowerCase().split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
};

export function decimals(num){
  if(isNaN(num)){
    var number = parseInt(num, 10);
    return number.toFixed(2);
  }
  return num.toFixed(2);
}