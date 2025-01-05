import type { Context } from "hono";
import { env } from "hono/adapter";
import { jwt } from "hono/jwt";
import { API_PREFIX } from "../constants";
import { AUTH_PREFIX, LOGIN_ROUTE, REGISTER_ROUTE } from "../controllers/auth";
import type { APIUser } from "../models/api";
export async function checkJWTAuth(
	c: Context,
	next: () => Promise<void>,
): Promise<Response | void> {
	// ログイン、サインアップの場合はJWTをチェックしない
	if (
		c.req.path === API_PREFIX + AUTH_PREFIX + LOGIN_ROUTE ||
		c.req.path === API_PREFIX + AUTH_PREFIX + REGISTER_ROUTE
	) {
		return await next();
	}

	const { JWT_SECRET } = env<{ JWT_SECRET: string }>(c); //.envからJWT_SECRETを取得
	const jwtMiddleware = jwt({ secret: JWT_SECRET });
	return jwtMiddleware(c, next);
}

/**JWT middlewareによってデコードされたJWTペイロードを取得 */
export async function attachUserId(
	c: Context,
	next: () => Promise<void>,
): Promise<Response | void> {
	const payload = c.get("jwtPayload") as APIUser;
	if (payload) {
		const id = payload.id;
		c.set("userId", id);
	}
	await next();
}
