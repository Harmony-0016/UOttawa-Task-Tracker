export function removeUndefined(obj: any): any {
  return JSON.parse(JSON.stringify(obj));
}
