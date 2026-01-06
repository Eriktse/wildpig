export interface ICreateServerOptions {
    host?: string,
    port?: number,
    showInfo?: boolean,
}


export interface IBuildOptions {
    /**
     * 入口文件的路径，默认是./server.ts
     */
    entry?: string,

    /**
     * 是否压缩代码，默认为true
     */
    minify?: boolean,

    /**
     * 输出目录，默认是./dist
     */
    outdir?: string,

    /**
     * 目标平台，默认是bun，如果需要打包成二进制文件，可以自行将打包出的js文件compile一次
     */
    target?: "node" | "bun",

    /**
     * 额外的外部依赖，默认是[]
     */
    external?: string[],
}