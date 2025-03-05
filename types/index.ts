export interface Reading {
    id: number;
    house_id: number;
    electric_government: number;
    created_at: string;
    electric_factory: number;
    water_factory: number;
    water_private: number;
    comment: string | null;
}

export interface Usage {
    house_id: number;
    start_gov_electric: number;
    end_gov_electric: number;
    usage_gov_electric: number;
    start_factory_electric: number;
    end_factory_electric: number;
    usage_factory_electric: number;
    start_factory_water: number;
    end_factory_water: number;
    usage_factory_water: number;
    start_backup_water: number;
    end_backup_water: number;
    usage_backup_water: number;
    start_created_at: string;
    end_created_at: string;
}

export type UsageKey = keyof Pick<
    Usage,
    | "usage_backup_water"
    | "usage_factory_water"
    | "usage_gov_electric"
    | "usage_factory_electric"
>;

export type UsageKeyMap<T> = Record<UsageKey, T>;