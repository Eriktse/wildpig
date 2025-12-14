import Bun from "bun";
import fs from "node:fs";


export const packageStatic = async () => {
    /** 打包js */
    await Bun.build({
        entrypoints: ["./public/render.tsx"],
        outdir: "./dist/public",
        format: "esm",
        minify: true,
    });
    
    /** 打包ico */
    fs.copyFileSync("./public/favicon.ico", "./dist/public/favicon.ico");
}