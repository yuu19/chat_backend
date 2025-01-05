import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
import { ContextVariables } from "../constants";
import type {
	DBChat,
	DBCreateChat,
	DBCreateMessage,
	DBMessage,
} from "../models/db";
import type { IDatabaseResource } from "../storage/types";

export const CHAT_PREFIX = "/chat/";
const CHAT_ROUTE = "";
const CHAT_MESSAGE_ROUTE = ":id/message/";
const CHAT_DETAIL_ROUTE = ":id/";
const idSchema = z.object({
	id: z.string().min(1),
});

const chatSchema = z.object({
	name: z.string().min(1),
});

const messageSchema = z.object({
	message: z.string().min(1),
});

export function createChatApp(
	chatResource: IDatabaseResource<DBChat, DBCreateChat>,
	messageResource: IDatabaseResource<DBMessage, DBCreateMessage>,
) {
	const chatAPP = new Hono<ContextVariables>();
	chatAPP.post(CHAT_ROUTE, zValidator("json", chatSchema ) async (c) => {
		const userId = await c.get("userId");
		const { name } = await c.req.valid("json");
		const data = await chatResource.create({
			ownedId: userId,
			name,
		});
		return c.json(data);
	});

	chatAPP.get(CHAT_ROUTE, async (c) => {
		const userId = await c.get("userId");
		const data = await chatResource.findAll({ ownedId: userId });
		return c.json({ data });
	});
  
	chatAPP.get(CHAT_DETAIL_ROUTE, 
		zValidator("param", idSchema),
		async (c) => {
			const { id } = c.req.param();
			const data = await chatResource.get(id);
			return c.json({ data });
		});

		
	chatAPP.get(CHAT_MESSAGE_ROUTE
		, zValidator("param", idSchema),
		 async (c) => {
		
		const { id: chatId } = c.req.param();
		const data = await messageResource.findAll({ chatId });
		return c.json({ data });
	});

	chatAPP.post(CHAT_MESSAGE_ROUTE, 
		zValidator("param", idSchema),
		zValidator("json", messageSchema),
		async (c) => {
		const { id: chatId } = c.req.valid("param");
		const { message } = await c.req.valid("json");
		const userMessage: DBCreateMessage = { message, chatId, type: "user" };
		const data = await messageResource.create(userMessage);
		return c.json({ data });
	});

	return chatAPP;
}
