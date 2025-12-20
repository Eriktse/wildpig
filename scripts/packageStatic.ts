import Bun from "bun";
import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname;

export const packageStatic = async () => {
    const targetPublicPath = "./dist/public";
    if(fs.existsSync(targetPublicPath)) fs.rmSync(targetPublicPath, { recursive: true });
    fs.mkdirSync(targetPublicPath, {recursive: true});
    /** 打包js */
    await Bun.build({
        entrypoints: [path.resolve(__dirname, "../public/render.tsx")],
        outdir: targetPublicPath,
        format: "esm",
        minify: true,
    });
    
    /** 打包ico */
    fs.copyFileSync("./public/favicon.ico", "./dist/public/favicon.ico");
}