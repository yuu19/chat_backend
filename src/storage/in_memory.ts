import type { DBEntity } from "../models/db";
import type { IDatabaseResource } from "./types";

// e.g T: DBChat  S: DBCreateChat
export class SimpleInMemoryResource<T extends S & DBEntity, S>
	implements IDatabaseResource<T, S>
{
	data: Array<T> = []; // データを保持するための配列
	async create(data: S): Promise<T> {
		// biome-ignore lint/style/useSingleVarDeclarator: <explanation>
		const fullData = {
			...data,
			createdAt: new Date(),
			updatedAt: new Date(),
			id: this.data.length.toString(),
		} as T;
		await this.data.push(fullData);
		return fullData;
	}

	async get(id: string): Promise<T | null> {
		const entity = this.data.find((d) => d.id === id);
		if (!entity) {
			return null;
		}
		return entity;
	}

	async delete(id: string): Promise<T | null> {
		const index = this.data.findIndex((d) => d.id === id);
		if (index === -1) {
			return null;
		}
		return this.data.splice(index, 1)[0];
	}
	async find(data: Partial<T>): Promise<T | null> {
		return (
			this.data.find((d) => {
				for (const key in data) {
					if (data[key] !== d[key]) {
						return false;
					}
				}
				return true;
			}) || null
		);
	}

	async findAll(data: Partial<T>): Promise<T[]> {
		return this.data.filter((d) => {
			for (const key in data) {
				if (data[key] !== d[key]) {
					return false;
				}
			}
			return true;
		});
	}

	async update(id: string, data: Partial<S>): Promise<T | null> {
		const entity = await this.get(id);
		if (!entity) {
			return null;
		}
		const updatedEntity = {
			...entity,
			...data,
			updatedAt: new Date(),
		} as T;

		// 既存のエンティティを削除して、新しいエンティティを追加する
		await this.delete(id);
		this.data.push(updatedEntity);
		return updatedEntity;
	}
}
