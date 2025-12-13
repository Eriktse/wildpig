



export const GET = (req: Request) => {
    return Response.json({
        message: "hello get",
    })
}


export const POST = async (req: Request) => {
    return Response.json({
        message: "hello post",
    })
}