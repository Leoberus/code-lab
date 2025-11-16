// src/routes/labs/[labSlug]/[problemSlug]/+page.ts
import type { PageLoad } from "./$types";
import { labs } from "$lib/problems";

export const load: PageLoad = ({ params }) => {
    const lab = labs.find((l) => l.slug === params.labSlug);
    if (!lab) {
        throw new Error("Lab not found");
    }

    const problem = lab.problems.find((p) => p.slug === params.problemSlug);
    if (!problem) {
        throw new Error("Problem not found");
    }

    return {
        lab,
        problem
    };
};
