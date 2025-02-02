import { isUUID } from 'class-validator';

export function whereId(id?: string | number): any {
  if (!id) return {};
  if (isUUID(id) && typeof id === 'string') return { uuid: id };
  return { id: Number(id) };
}
