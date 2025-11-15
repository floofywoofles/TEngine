import type { Scene } from "./scene";

type GlobalMapType = {
    [key: string]: Scene
}
const config: Partial<GlobalMapType> = {};

export function setConfigMap<Key extends keyof GlobalMapType>(key: Key, value: GlobalMapType[Key]){
    config[key] = value;
}

export function getConfigKey<Key extends keyof GlobalMapType>(key: Key): unknown {
    return config[key];
}