



export const GET = (req: Request) => {
    return Response.json({
        message: "hello get123",
    })
}


export const POST = async (req: Request) => {
    return Response.json({
        message: "hello post",
    })
}