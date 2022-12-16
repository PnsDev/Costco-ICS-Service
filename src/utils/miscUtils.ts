/**
 * Removes the specified item from the array and returns it
 * @param arr The array to remove the item from
 * @param value The item to remove
 * @returns The removed item
 */
export function removeItem<T>(arr: Array<T>, value: T): T {
  const index = arr.indexOf(value);
  if (index === -1) return null;
  return arr.splice(index, 1)[0];
}

/**
 * Delays the execution of the next line of code by the specified number of milliseconds
 * @param mili The number of milliseconds to delay
 * @returns A promise that is resolved after the specified number of milliseconds
 */
export function delay(mili: number) : Promise<any> {
  return new Promise(r => setTimeout(r, mili))
}