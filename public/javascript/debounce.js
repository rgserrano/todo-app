export default (func, delay) => {
  let isDelayed = false;
  
  return (...args) => {
    if (!isDelayed) {
      func.apply(null, args);

      isDelayed = true;
      setTimeout( () => isDelayed = false, delay);
    }
  }
}