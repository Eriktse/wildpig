




export const GET = async (req: Request & {params: {id: string}}) => {
    const id = req.params.id;
    return Response.json({
        title: "Hello " + id,
    });
}