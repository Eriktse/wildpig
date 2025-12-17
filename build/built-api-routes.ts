import { middleware } from "@/middleware" 
import {
	GET as GET1,
	POST as POST1,
} from "#/src/api/hello/index";
import {
	GET as GET2,
} from "#/src/api/server-data/hello/index";

export default {
	"/api/hello": {
		GET: (req: any) => middleware(req, GET1),
		POST: (req: any) => middleware(req, POST1),
	},
	"/api/server-data/hello": {
		GET: (req: any) => middleware(req, GET2),
	},
}