
let wildpigServer: Bun.Server<undefined>;
if( process.env.NODE_ENV !== 'production') {
    wildpigServer = await import("./scripts/devServer") as any;
}else{
    wildpigServer = await import("./scripts/prodServer") as any;
}

export default { 
    wildpigServer
}