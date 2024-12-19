/**
 * S: エンティティを作成するために必要なフィールドすべてを持つ型
 * T: DBエンティティすべてのフィールドを持つ型
 */
export interface IDatabaseResource<T, S> {
	get(id: string): Promise<T>;
	create(data: S): Promise<T>;
	update(id: string, data: Partial<S>): Promise<T | null>;
	find(data: Partial<T>): Promise<T>;
	findAll(data: Partial<T>): Promise<T[]>;
	delete(id: string): Promise<T | null>;
}
