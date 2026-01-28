import { HmrOptions, ViteDevServer } from "vite";



export const wildpigDynamicHmrClientPort = () => {
    return {
        name: 'wildpig-dynamic-hmr-client-port',
        configureServer(server: ViteDevServer) {
          server.middlewares.use((req, res, next) => {
            // 从请求头中获取原始端口（如果代理设置了正确的header）
            const host = req.headers['host'] as string;
            if (!host)return next();
            
            
            const portMatch = host.match(/:(\d+)$/);
            const port = portMatch ? portMatch[1] : undefined;
            const originalPort = (server.config.server?.hmr as HmrOptions)?.clientPort || server.config.server?.port;

            if(originalPort && port && req.url?.includes("/@vite/client")){
                let buffer: Buffer[] = [];

                const originalWrite = res.write.bind(res);
                const originalEnd = res.end.bind(res);
                
                res.write = function(chunk: any, encoding?: any, callback?: any) {
                    if (chunk) buffer.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
                    return true;
                }
                
                res.end = function(chunk?: any, encoding?: any, callback?: any) {
                    if (chunk) buffer.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
                    
                    const content = Buffer.concat(buffer).toString('utf-8');
                    const newContent = content
                        .replace(`const hmrPort = ${originalPort};`, `const hmrPort = ${port};`)
                        .replace(`const hmrPort = "${originalPort}";`, `const hmrPort = "${port}";`)
                    const newContentBuffer = Buffer.from(newContent, 'utf-8');
                    
                    // 设置正确的 Content-Length（使用新内容的长度）
                    res.setHeader('Content-Length', newContentBuffer.length);
                    
                    // 恢复原始方法
                    res.write = originalWrite;
                    res.end = originalEnd;
                    
                    // 发送修改后的内容
                    originalEnd(newContentBuffer, encoding, callback);
                    return res;
                }
            }

            next()
          })
        },
    }
};