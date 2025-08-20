import axios from "axios";
import * as cheerio from "cheerio";

export const scrapeWebsite = async (url) => {
  try {
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    $("script, style, noscript, iframe, svg").remove();

    const title = $("title")?.text()?.trim();

    let content = "";

    $("body *").each((_, el) => {
      const text = $(el).text().trim();
      if (text) {
        content += text + "\n";
      }
    });

    content = content.replace(/\n+/g, "\n").trim();

    // const structured = [];
    // $("body *").each((_, el) => {
    //   const text = $(el).text().trim();
    //   if (text) {
    //     structured.push({
    //       tag: el.tagName,
    //       text,
    //     });
    //   }
    // });

    return { title, content };
  } catch (err) {
    console.error("❌ Error scraping site:", err.message);
    return { success: false, error: err.message };
  }
};
