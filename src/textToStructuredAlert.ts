import {
    FunctionDeclaration,
    GoogleGenerativeAI,
    SchemaType,
} from "@google/generative-ai";
import * as crypto from "crypto";
import { Entity, EntitySelector, TimeRange } from "./types";

if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY env var is required");
}

const genAi = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

const functions = {
    generateHashFromText: ({ text }) => {
        console.log("Generating hash from text", text);
        return crypto.createHash("md5").update(text).digest("hex");
    },
};

const model = genAi.getGenerativeModel({
    model: "gemini-1.5-flash",
    // tools: [
    //     {
    //         functionDeclarations: [generateHashFromTextFunctionDeclaration],
    //     },
    // ],
    generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
            type: SchemaType.OBJECT,
            properties: {
                id: {
                    type: SchemaType.STRING,
                    description:
                        "The alert identifier is the name of the agency lowercased, with spaces replaced with hyphens.",
                },
                alert: {
                    type: SchemaType.OBJECT,
                    properties: {
                        active_period: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    start: {
                                        type: SchemaType.STRING,
                                        description:
                                            "Start time for alert effect, in the 'YYYY-MM-DDTHH:MM:SS' format",
                                    },
                                    end: {
                                        type: SchemaType.STRING,
                                        description:
                                            "End time for alert effect, in the 'YYYY-MM-DDTHH:MM:SS' format",
                                    },
                                },
                                required: ["start", "end"],
                            },
                        },
                        informed_entity: {
                            type: SchemaType.ARRAY,
                            items: {
                                type: SchemaType.OBJECT,
                                properties: {
                                    agency_id: {
                                        type: SchemaType.STRING,
                                        description:
                                            "Only populate if the alert affects the whole agency",
                                    },
                                    route_id: {
                                        type: SchemaType.STRING,
                                    },
                                    // route_type: {
                                    //     type: SchemaType.INTEGER,
                                    // },
                                    // direction_id: {
                                    //     type: SchemaType.INTEGER,
                                    // },
                                    // trip: {
                                    //     type: SchemaType.OBJECT,
                                    //     properties: {
                                    //         trip_id: {
                                    //             type: SchemaType.STRING,
                                    //         },
                                    //         route_id: {
                                    //             type: SchemaType.STRING,
                                    //         },
                                    //         direction_id: {
                                    //             type: SchemaType.INTEGER,
                                    //         },
                                    //         start_time: {
                                    //             type: SchemaType.STRING,
                                    //         },
                                    //         start_date: {
                                    //             type: SchemaType.STRING,
                                    //         },
                                    //         schedule_relationship: {
                                    //             type: SchemaType.INTEGER,
                                    //             enum: ['SCHEDULED', 'ADDED', 'UNSCHEDULED', 'CANCELED', 'DUPLICATED', 'DELETED'],
                                    //         },
                                    //     },
                                    // }
                                    stop_id: {
                                        type: SchemaType.STRING,
                                    },
                                },
                            },
                        },
                        cause: {
                            type: SchemaType.STRING,
                            enum: [
                                "UNKNOWN_CAUSE",
                                "OTHER_CAUSE",
                                "TECHNICAL_PROBLEM",
                                "STRIKE",
                                "DEMONSTRATION",
                                "ACCIDENT",
                                "HOLIDAY",
                                "WEATHER",
                                "MAINTENANCE",
                                "CONSTRUCTION",
                                "POLICE_ACTIVITY",
                                "MEDICAL_EMERGENCY",
                            ],
                            nullable: false,
                        },
                        // cause_detail: { },
                        effect: {
                            type: SchemaType.STRING,
                            enum: [
                                "NO_SERVICE",
                                "REDUCED_SERVICE",
                                "SIGNIFICANT_DELAYS",
                                "DETOUR",
                                "ADDITIONAL_SERVICE",
                                "MODIFIED_SERVICE",
                                "OTHER_EFFECT",
                                "UNKNOWN_EFFECT",
                                "STOP_MOVED",
                                "NO_EFFECT",
                                "ACCESSIBILITY_ISSUE",
                            ],
                            nullable: false,
                        },
                        // effect_detail: { },
                        url: {
                            type: SchemaType.OBJECT,
                            description:
                                "If no URL is provided, the field should be null",
                            properties: {
                                translation: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            text: {
                                                type: SchemaType.STRING,
                                            },
                                            language: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "BCP-47 language code",
                                            },
                                        },
                                        required: ["text", "language"],
                                    },
                                },
                            },
                            nullable: true,
                            required: ["translation"],
                        },
                        header_text: {
                            type: SchemaType.OBJECT,
                            properties: {
                                translation: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            text: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "Gramatically correct text",
                                            },
                                            language: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "BCP-47 language code",
                                            },
                                        },
                                        required: ["text", "language"],
                                    },
                                },
                            },
                            nullable: false,
                            required: ["translation"],
                        },
                        description_text: {
                            type: SchemaType.OBJECT,
                            properties: {
                                translation: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            text: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "Gramaatically correct text",
                                            },
                                            language: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "BCP-47 language code",
                                            },
                                        },
                                        required: ["text", "language"],
                                    },
                                },
                            },
                            nullable: false,
                            required: ["translation"],
                        },
                        // tts_header_text: { },
                        // tts_description_text: { },
                        // severity_level: { },
                        image: {
                            type: SchemaType.OBJECT,
                            properties: {
                                localized_image: {
                                    type: SchemaType.ARRAY,
                                    items: {
                                        type: SchemaType.OBJECT,
                                        properties: {
                                            url: {
                                                type: SchemaType.STRING,
                                            },
                                            media_type: {
                                                type: SchemaType.STRING,
                                                description:
                                                    'IANA media type, must start with "image/"',
                                            },
                                            language: {
                                                type: SchemaType.STRING,
                                                description:
                                                    "BCP-47 language code",
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        // image_alternative_text: { }
                    },
                    required: [
                        "active_period",
                        "informed_entity",
                        "cause",
                        "effect",
                        "url",
                        "header_text",
                        "description_text",
                    ],
                },
            },
        },
    },
});

export async function generateGtfsRtFromUnstructuredAlertPayload(
    unstructuredAlertContent: string,
    unstructuredAlertContentLang: string,
    alertUrl: string,
    agencyName: string,
    overrideAlertTitle?: string
) {
    console.log("overrideAlertTitle", overrideAlertTitle, !!overrideAlertTitle);
    const prompt = `Generate GTFS-RT alert properties from this unstructured alert: "${unstructuredAlertContent}".
                The agency name is ${agencyName}.
                ${
                    overrideAlertTitle
                        ? `The alert title is ${overrideAlertTitle} and in ${unstructuredAlertContentLang} language. Do not change it in its original language. Translate it to en.`
                        : ""
                }
                The alert is in ${unstructuredAlertContent}, the human readable content should be generated in that language and en.
                If there are images, consider them ONLY in ${unstructuredAlertContentLang}, do not include other translations for images if they aren't provided.
                Consider ids of entities as they are in the alert.
                The alert url is ${alertUrl} and it's in ${unstructuredAlertContentLang}, do not include other translations for urls if they aren't provided.
                Human readable content MUST NOT contain any structured data, only gramatically correct text, ONLY include what is RELEVANT on human readable info, SKIP formatting, headings, etc.
                The current date is ${new Date().toISOString()},
                Any relative or incomplete date should be considered:
                - if no year is provided, consider the current year
                - if no time is provided, consider 00:00:00.
                You should only use agency_id on the informed_entity if the alert affects the whole agency, for example, an agency-wide strike.
                `;

    console.log("Generating...");
    const result = await model.generateContent(prompt);
    const textResult = result.response.text();
    const jsonResult = JSON.parse(textResult) as Entity;

    // treat the result
    const hashedAlertTitle = functions.generateHashFromText({
        text:
            overrideAlertTitle ||
            jsonResult.alert.header_text.translation.find(
                (t) => t.language === unstructuredAlertContentLang
            )?.text,
    });

    jsonResult.id = `${agencyName}:alert:${hashedAlertTitle}`;

    if (overrideAlertTitle) {
        jsonResult.alert.header_text.translation.find(
            (t) => t.language === unstructuredAlertContentLang
        )!.text = overrideAlertTitle + "mlem";
    }

    jsonResult.alert.informed_entity.forEach((entity: EntitySelector) => {
        if (entity.agency_id == null) delete entity.agency_id;
        if (entity.route_id == null) delete entity.route_id;
        if (entity.stop_id == null) delete entity.stop_id;

        return entity;
    });

    jsonResult.alert.active_period.forEach((period: TimeRange) => {
        period.start = Date.parse(String(period.start)) / 1000;
        period.end = Date.parse(String(period.end)) / 1000;

        return period;
    });

    return {
        generatedAlert: jsonResult,
        usageMetadata: result.response.usageMetadata,
    };
}
