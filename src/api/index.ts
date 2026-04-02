import { events } from "@silverbulletmd/silverbullet/syscalls";

export type { InitCallback, MapViewAPI } from "../runtime/api.ts";


export const test = () => {


    events.dispatchEvent("mapview-test", { message: "Hello from the map view API!" });
}
