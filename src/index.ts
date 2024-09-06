import fastify from "fastify";
import * as cheerio from "cheerio";
import { generateGtfsRtFromUnstructuredAlertPayload } from "./textToStructuredAlert";

const server = fastify();

const alertUrlDomainAllowList = [
    {
        agencyName: "mobicascais",
        allowList: [
            "mobi.cascais.pt",
            "mobicascais.pt",
            "www.mobi.cascais.pt",
            "www.mobicascais.pt",
        ],
    },
    {
        agencyName: "carris",
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

    if (agency.agencyName === "mobicascais") {
        const htmlPayload = await fetch(alertSourceUrl).then((res) =>
            res.text()
        );

        const $ = cheerio.load(htmlPayload);
        const alertTitle = $(".page-title").text();
        const slimmedPayload = `
        ${$(".page-title").html()}\n
        ${$('[role="article"]').html()}\n
        `;

        if (!slimmedPayload) {
            return reply.code(404).send({
                error: true,
                message: "No alert content found.",
            });
        }

        const generatedAlert = await generateGtfsRtFromUnstructuredAlertPayload(
            slimmedPayload,
            "pt",
            alertSourceUrl,
            agency.agencyName,
            alertTitle
        );

        return reply.send({
            generated: generatedAlert,
        });
    }

    if (agency.agencyName == "carris") {
        const htmlPayload = await fetch(alertSourceUrl).then((res) =>
            res.text()
        );

        const $ = cheerio.load(htmlPayload);

        const alertTitle = $("#page-title").text();
        console.log("ALWERTITLTE", alertTitle);
        const slimmedPayload = $("#content").html()?.trim();

        if (!slimmedPayload) {
            return reply.code(404).send({
                error: true,
                message: "No alert content found.",
            });
        }

        try {
            const generatedAlert =
                await generateGtfsRtFromUnstructuredAlertPayload(
                    slimmedPayload,
                    "pt",
                    alertSourceUrl,
                    agency.agencyName,
                    alertTitle
                );

            return reply.send({
                success: true,
                generated: generatedAlert,
            });
        } catch (e) {
            return reply.code(500).send({
                error: true,
                message: "Error generating alert.",
                exception: e,
            });
        }
    }
});

server.listen({ port: 8080 }, (err, address) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }
    console.log(`Server listening at ${address}`);
});
