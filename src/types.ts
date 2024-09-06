export interface TimeRange {
    start?: number | string;
    end?: number | string;
}

export enum Cause {
    UNKNOWN_CAUSE,
    OTHER_CAUSE,
    TECHNICAL_PROBLEM,
    STRIKE,
    DEMONSTRATION,
    ACCIDENT,
    HOLIDAY,
    WEATHER,
    MAINTENANCE,
    CONSTRUCTION,
    POLICE_ACTIVITY,
    MEDICAL_EMERGENCY,
}

export enum Effect {
    NO_SERVICE,
    REDUCED_SERVICE,
    SIGNIFICANT_DELAYS,
    DETOUR,
    ADDITIONAL_SERVICE,
    MODIFIED_SERVICE,
    OTHER_EFFECT,
    UNKNOWN_EFFECT,
    STOP_MOVED,
}

export interface TranslatedString {
    translation: Translation[];
}

export interface Translation {
    text: string;
    language?: string;
}

export interface Alert {
    active_period: TimeRange[];
    informed_entity: EntitySelector[];
    cause: Cause;
    effect: Effect;
    url: TranslatedString;
    header_text: TranslatedString;
    description_text: TranslatedString;
}

export interface EntitySelector {
    agency_id?: string;
    route_id?: string;
    // route_type?: number;
    // direction_id?: number;
    // trip?: RealTimeTrip;
    stop_id?: string;
}

export interface Entity {
    id: string;
    // trip_update?: TripUpdate;
    // vehicle?: VehiclePosition;
    // is_deleted?: boolean;
    alert: Alert;
}
