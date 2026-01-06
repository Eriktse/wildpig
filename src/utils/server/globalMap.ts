// 全局注册器
declare global {
    var __wildpigGlobalMap: Map<string, any>;
}

const getWildpigGlobalMap = () => {
    if (!globalThis.__wildpigGlobalMap) {
        globalThis.__wildpigGlobalMap = new Map();
    }
    return globalThis.__wildpigGlobalMap;
}

const getItem = <T>(key: string): T | undefined => {
    if (!getWildpigGlobalMap().has(key)) return undefined;
    return getWildpigGlobalMap().get(key) as T;
}

const setItem = <T>(key: string, value: T) => {
    getWildpigGlobalMap().set(key, value);
}

const getAll = () => {
    return getWildpigGlobalMap();
}

export const wildpigGlobalMap = {
    getItem,
    setItem,
    getAll
}