export function logAggregation(userId: string, message: string, extra?: any) {
  const prefix = `[aggregation][user=${userId}]`;
  if (extra !== undefined) {
    console.log(prefix, message, JSON.stringify(extra, null, 2));
  } else {
    console.log(prefix, message);
  }
}
