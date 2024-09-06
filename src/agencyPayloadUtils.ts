import * as cheerio from "cheerio";

export async function mobicascaisFetchAndParseHtml(url: string): Promise<{
    alertTitle: string;
    slimmedPayload: string;
}> {
    const htmlPayload = await fetch(url).then((res) => res.text());

    const $ = cheerio.load(htmlPayload);
    const alertTitle = $(".page-title").text();
    const slimmedPayload = $('[role="article"]').html()?.trim();

    if (!slimmedPayload) {
        throw new Error("No alert content found.");
    }

    return {
        alertTitle,
        slimmedPayload,
    };
}

export async function carrisFetchAndParseHtml(url: string): Promise<{
    alertTitle: string;
    slimmedPayload: string;
}> {
    const htmlPayload = await fetch(url).then((res) => res.text());

    const $ = cheerio.load(htmlPayload);

    const alertTitle = $("#page-title").text();
    const slimmedPayload = $("#content").html()?.trim();

    if (!slimmedPayload) {
        throw new Error("No alert content found.");
    }

    return {
        alertTitle,
        slimmedPayload,
    };
}
