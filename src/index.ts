import fastify from "fastify";
import * as cheerio from "cheerio";
import { generateGtfsRtFromUnstructuredAlertPayload } from "./textToStructuredAlert";
import {
    carrisFetchAndParseHtml,
    mobicascaisFetchAndParseHtml,
} from "./agencyPayloadUtils";

const PORT = Number(process.env.PORT) || 8080;
const server = fastify();

const alertUrlDomainAllowList = [
    {
        name: "mobicascais",
        allowList: [
            "mobi.cascais.pt",
            "mobicascais.pt",
            "www.mobi.cascais.pt",
            "www.mobicascais.pt",
        ],
    },
    {
        name: "carris",
        allowList: ["carris.pt", "www.carris.pt"],
    },
];

server.get<{
    Querystring: {
        url: string;
    };
}>("/generate", async (request, reply) => {
    const alertSourceUrl = request.query.url;
    const alertSourceUrlDomain = new URL(alertSourceUrl).hostname;

    const agency = alertUrlDomainAllowList.find((agency) =>
        agency.allowList.includes(alertSourceUrlDomain)
    );

    if (!agency) {
        return reply.code(403).send({
            error: true,
            message: "Alert URL domain not in allow list.",
        });
    }

    try {
        const { alertTitle, slimmedPayload } =
            agency.name == "mobicascais"
                ? await mobicascaisFetchAndParseHtml(alertSourceUrl)
                : await carrisFetchAndParseHtml(alertSourceUrl);

        const generatedAlert = await generateGtfsRtFromUnstructuredAlertPayload(
            slimmedPayload,
            "pt",
            alertSourceUrl,
            agency.name,
            alertTitle
        );

        reply.send({
            generatedAlert,
        });
    } catch (e) {
        reply.code(500).send({
            error: true,
            message: "Error generating alert.",
            exception: e,
        });
    }
});

server.listen({ port: PORT }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
