



const GET = (req: Request) => {
    return Response.json({
        message: "hello get123",
    })
}


const POST = async (req: Request) => {
    return Response.json({
        message: "hello post",
    })
}

export default {
    GET,
    POST
}