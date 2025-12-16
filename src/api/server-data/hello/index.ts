


export const GET = () => {
    return Response.json({
        title: "Index页面",
        data: {
            message: "hello server."
        }
    })
}

export default { GET }