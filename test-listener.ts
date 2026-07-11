import { Zalo } from "zca-js";

const zalo = new Zalo({ logging: false }, { checkUpdate: false });
console.log(zalo.listener ? "zalo.listener EXISTS" : "zalo.listener DOES NOT EXIST");
