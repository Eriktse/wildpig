import { middleware } from "@/api/middleware" 
import {
	POST as POST1,
} from "#/src/api/add/index";
import {
	GET as GET2,
} from "#/src/api/say-hello/index";
import {
	GET as GET3,
} from "#/src/api/server-data/404/index";
import {
	GET as GET4,
} from "#/src/api/server-data/welcome/index";

export default {
	"/api/add": {
		POST: (req: any) => middleware(req, POST1),
	},
	"/api/say-hello": {
		GET: (req: any) => middleware(req, GET2),
	},
	"/api/server-data/404": {
		GET: (req: any) => middleware(req, GET3),
	},
	"/api/server-data/welcome": {
		GET: (req: any) => middleware(req, GET4),
	},
}