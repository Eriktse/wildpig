


export const GET = (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1]);
    const name = params.get("name");
    return new Response("Hey, " + name + ".");
}