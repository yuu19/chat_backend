import { Hono } from "hono";
import { logger } from "hono/logger";
import { timing } from "hono/timing";

import { createInMemoryApp } from "./controllers/main";
const app = createInMemoryApp();
export default app;
