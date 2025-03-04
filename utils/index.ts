import type { Usage } from "~/types";

export const replacePrefix = (key: keyof Usage, prefix: "start" | "end") => {
    return key.replace(/(start|end|usage)/, prefix) as keyof Usage;
};
