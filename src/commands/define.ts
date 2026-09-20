import {
  AutocompleteInteraction,
  type CacheType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../core/command.js";
import ky from "ky";
import he from "he";

const MDN_SEARCH_URL = "https://developer.mozilla.org/api/v1/search";

const decodeHTML = (text: string) =>
  text.replace(/<mark>/g, "**").replace(/<\/mark>/g, "**");

export default class DefineCommand extends Command {
  public name: string = "define";
  public data = new SlashCommandBuilder()
    .setDescription("Fetch mdn docs for definitions.")
    .addStringOption((option) =>
      option
        .setName("term")
        .setDescription(
          "The term to define. (Start typing... we have autocomplete!)",
        )
        .setRequired(true)
        .setAutocomplete(true),
    );

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const term = interaction.options.getString("term", true);

    await interaction.deferReply();

    try {
      const searchURL = new URL(MDN_SEARCH_URL);

      searchURL.searchParams.set("q", term);

      const search = await ky
        .get(MDN_SEARCH_URL, {
          searchParams: {
            q: term,
            locale: "en-us",
          },
        })
        .json<{
          documents: {
            mdn_url: string;
            title: string;
            locale: string;
            slug: string;
            popularity: number;
            score: number;
            summary: string;
            highlight: {
              body?: string[];
              title?: string[];
            };
          }[];
          metadata: {
            took_ms: number;
            size: number;
            page: number;
            total: number;
          };
        }>();

      if (!search.documents.length) {
        await interaction.editReply(
          `Couldn't find a definition for **${term}** on MDN.`,
        );
        return;
      }

      const normalizedTerm = term.trim().toLowerCase();

      const result =
        search.documents.find(
          (doc) =>
            doc.title.toLowerCase() == normalizedTerm ||
            doc.slug.toLowerCase() == normalizedTerm,
        ) ?? search.documents[0];

      if (!result) {
        await interaction.editReply(`Couldn't find **${term}** on MDN.`);
        return;
      }

      const url = `https://developer.mozilla.org${result.mdn_url}`;

      const highlights = result.highlight;

      const embed = new EmbedBuilder()
        .setTitle(result.title)
        .setURL(url)
        .setDescription(
          (result.summary || "No description available.") +
            (highlights.title?.length
              ? `\n\n**Matching title(s):** ${decodeHTML(he.decode(highlights.title?.join(", ")))}`
              : "") +
            (highlights.body?.length
              ? `\n\n**Related Information:**\n${highlights.body.map((snippet) => decodeHTML(he.decode(snippet))).join("\n\n")}`
              : ""),
        )

        .setColor("#0da79d")
        .setFooter({
          text: "Source: MDN Web Docs",
        });

      embed.addFields({
        name: "Documentation",
        value: `[View on MDN](${url})`,
      });

      // if (highlights.title?.length) {
      //   embed.addFields({
      //     name: "Matching titles",
      //     value: highlights.title
      //       .map((title) => decodeHTML(he.decode(title)))
      //       .join("\n")
      //       .slice(0, 1024),
      //   });
      // }
      //
      // if (highlights.body?.length) {
      //   embed.addFields({
      //     name: "Related information",
      //     value: highlights.body
      //       .map((snippet) => decodeHTML(he.decode(snippet)))
      //       .join("\n\n"),
      //   });
      // }

      await interaction.editReply({
        embeds: [embed],
      });
    } catch (err) {
      console.error("MDN search failed:", err);

      await interaction.editReply(
        "Something went wrong while searching MDN. Please try again later.",
      );
    }
  }
  public override async autocomplete(
    interaction: AutocompleteInteraction<CacheType>,
  ): Promise<void> {
    const focused = interaction.options.getFocused();

    if (!focused) {
      await interaction.respond([]);
      return;
    }

    try {
      const search = await ky
        .get(MDN_SEARCH_URL, {
          searchParams: {
            q: focused,
          },
        })
        .json<{
          documents: {
            title: string;
            slug: string;
          }[];
        }>();

      const choices = search.documents.slice(0, 25).map((doc) => ({
        name: doc.title.slice(0, 100),
        value: doc.slug,
      }));

      await interaction.respond(choices);
    } catch (err) {
      console.error("MDN autocomplete failed:", err);
      await interaction.respond([]);
    }
  }
}
