import Bun from "bun";
import fs from "node:fs";
import path from "node:path";

const __dirname = import.meta.dirname;

export const packageStatic = async () => {
    /** 打包js */
    await Bun.build({
        entrypoints: [path.resolve(__dirname, "../public/render.tsx")],
        outdir: path.resolve(__dirname, "../dist/public"),
        format: "esm",
        minify: true,
    });
    
    /** 打包ico */
    fs.copyFileSync("./public/favicon.ico", "./dist/public/favicon.ico");
}