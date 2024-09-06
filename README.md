# Alerts to GTFS-RT Alerts

This is an experiment to generate GTFS-RT alerts from alerts in other formats (mostly natural language only alerts with no other metadata associated).

HTML is a good candidate for this since agencies like to publish alerts only on their websites and provide no APIs to obtain them.

As always (as is common with tools of the kind), this is not very reliable and the prompt could probably use some improvement (reducing the tokens while still keeping a relatively stable and predictable result).

Gemini API is very generous (especially the gemini-1.5-flash model, but overall more predictable outputs can be obtained with the gemini-1.5-pro, with a less generous rate limit) which allows for this to be iterated on very fast at virtually no cost.

It's a cool experiment and can allow for some automation but the output still requires som kind of manual checking to make sure everything is ok.

Issues that have been popping up:

-   Including markup/formatted markdown in human readable fields (description_text, mostly). The idea is for thos fields to be composed only of gramtically correct, unformatted prose.
-   Translations not matching the language
-   Original text not being kept as-is: the idea is to keep as much of the alert as it was published by the agency. This loves to paraphrase and change text to something worded differently. header_text is right now programatically kept as-is, and the Gemini output is only consiudered for translations to languages other than the original one.
