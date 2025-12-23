import { middleware } from "@/api/middleware" 
import {
	GET as GET1,
} from "#/src/api/hello/index";
import {
	GET as GET2,
} from "#/src/api/server-data/home/index";
import {
	GET as GET3,
} from "#/src/api/server-data/post/index";

export default {
	"/api/hello": {
		GET: (req: any) => middleware(req, GET1),
	},
	"/api/server-data/home": {
		GET: (req: any) => middleware(req, GET2),
	},
	"/api/server-data/post": {
		GET: (req: any) => middleware(req, GET3),
	},
}