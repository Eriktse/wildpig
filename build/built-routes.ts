import { middleware } from "@/middleware";

export default {
"/api/hello": {GET: (req: any) => middleware(req, require("#/src/api/hello/index.ts").GET), 
POST: (req: any) => middleware(req, require("#/src/api/hello/index.ts").POST), 
PUT: (req: any) => middleware(req, require("#/src/api/hello/index.ts").PUT), 
DELETE: (req: any) => middleware(req, require("#/src/api/hello/index.ts").DELETE), 
}
}