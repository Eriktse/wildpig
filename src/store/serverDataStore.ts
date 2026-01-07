import { atom, PreinitializedWritableAtom } from "nanostores";
import { wildpigGlobalMap } from "../utils/server/globalMap";

export const getServerDataStore = <T>(): PreinitializedWritableAtom<T | undefined> & object => {
    if(!wildpigGlobalMap.getItem("__WildpigServerDataStore__")){
        wildpigGlobalMap.setItem("__WildpigServerDataStore__", atom<T | undefined>(undefined));
    }
    return wildpigGlobalMap.getItem("__WildpigServerDataStore__") as PreinitializedWritableAtom<T | undefined> & object;
}