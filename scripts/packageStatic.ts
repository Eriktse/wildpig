import Bun from "bun";
import fs, { readFileSync, writeFileSync } from "node:fs";
import { brotliCompressSync, constants } from "node:zlib";


export const packageStatic = async () => {
    /** 打包js */
    await Bun.build({
        entrypoints: ["./public/render.tsx"],
        outdir: "./dist/public",
        format: "esm",
        minify: true,
    });
    // 将 ./public/render.js 转为 ./public/render.br
    writeFileSync("./dist/public/render.js.br", brotliCompressSync(
        Buffer.from(readFileSync("./dist/public/render.js")),
        {
            params: {
                [constants.BROTLI_PARAM_QUALITY]:  11,   // 最高质量
                [constants.BROTLI_PARAM_LGWIN]:    16,   // 最大窗口 16 MB
                [constants.BROTLI_PARAM_MODE]:     constants.BROTLI_MODE_TEXT, // 针对文本优化
            }
        }
    ));
    
    /** 打包ico */
    fs.copyFileSync("./public/favicon.ico", "./dist/public/favicon.ico");
}