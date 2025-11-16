import type { PageLoad } from "./$types";
import { labs } from "$lib/problems";

export const load: PageLoad = () => {
    return { labs };
};
