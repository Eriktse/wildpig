


export const GET = (req: Request & {params: {id: string}}) => {
    const id = req.params.id;
    const idNumber = parseInt(id);
    return Response.json({
        title: "id: " + (idNumber + 1145),
        data: {
            message: "hello server."
        }
    })
}