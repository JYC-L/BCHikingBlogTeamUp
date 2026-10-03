export function trailSearchFilter(query: string): Record<string, unknown> {
  const q = query.trim();
  if (!q) return {};
  const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
  return {
    $or: [
      { name: pattern },
      { location: pattern },
      { difficulty: pattern },
      { description: pattern },
    ],
  };
}
