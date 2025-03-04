import type { UsageKeyMap } from "~/types";

export const attributeLabelsMap: UsageKeyMap<string> = {
    usage_gov_electric: "Electric Government",
    usage_factory_electric: "Electric Factory",
    usage_factory_water: "Water Factory",
    usage_backup_water: "Water Private",
};

export const attributeCostMap: UsageKeyMap<number> = {
    usage_gov_electric: 10,
    usage_factory_electric: 25,
    usage_factory_water: 300,
    usage_backup_water: 300,
};
