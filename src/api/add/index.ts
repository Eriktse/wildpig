



export const POST = async (req: Request) => {
    const {a, b} = await req.json();
    return Response.json({
        result: a + b
    });
}