import { middleware } from "@/api/middleware" 
import {
	GET as GET1,
	POST as POST1,
} from "#/src/api/hello/index";
import {
	GET as GET2,
} from "#/src/api/server-data/hello/[id]/index";
import {
	GET as GET3,
} from "#/src/api/server-data/home/index";

export default {
	"/api/hello": {
		GET: (req: any) => middleware(req, GET1),
		POST: (req: any) => middleware(req, POST1),
	},
	"/api/server-data/hello/:id": {
		GET: (req: any) => middleware(req, GET2),
	},
	"/api/server-data/home": {
		GET: (req: any) => middleware(req, GET3),
	},
}