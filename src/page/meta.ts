


export const getMeta = async (req: Request) => {
    const params = new URLSearchParams(req.url.split("?")[1] || "");
    return Response.json({
        title: params.get("title") || "首页",
        description: params.get("description") || "这是首页",
        keywords: params.get("keywords")?.split(",") || ["首页", "WildPig"]
    });
}