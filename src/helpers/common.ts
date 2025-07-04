export const throttle = <T extends (...args: any[]) => any>(
  func: T, 
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timer: number | null = null;
  const that: any = this;
  return function(...args: Parameters<T>): void {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(that, args);
        timer = null;
      }, delay);
    }
  };
};