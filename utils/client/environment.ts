


export const getBrowserEnvironment = () => {
    const metaTags = document.head.getElementsByTagName("meta");
    if(!metaTags || metaTags.length === 0)
        return "production";
    // 如果某个meta标签的name属性为wildpig-environment，且content属性为development，则返回development
    if(Array.from(metaTags).some(metaTag => 
        metaTag.getAttribute("name") === "wildpig-environment"
        && metaTag.getAttribute("content") === "development"
    )){
        return "development";
    }

    return "production";
}