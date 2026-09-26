import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  AttachmentBuilder,
  ContainerBuilder,
  SeparatorSpacingSize,
  MessageFlags,
  ButtonBuilder,
  ButtonStyle,
} from "discord.js";
import { Command } from "../core/command.js";
import { config } from "../lib/config.js";

export default class PingCommand extends Command {
  public name: string = "info";
  public data = new SlashCommandBuilder().setDescription(
    "Get information about the bot & the club",
  );

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    await interaction.deferReply();

    const nicsCircle = new AttachmentBuilder("./assets/nics-compressed.jpeg", {
      name: "nics.jpeg",
    });

    const component = new ContainerBuilder()
      .setAccentColor(config.accentColor)
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              [
                "## Heya, I'm Nico :)",
                "I’m here to make the NICS Discord a little more useful, and hopefully a little more fun :) I’m pretty good at what I do, although I occasionally make questionable decisions.",
              ].join("\n"),
            ),
          )
          .setThumbnailAccessory((thumbnail) =>
            thumbnail.setURL(interaction.client.user.avatarURL() ?? ""),
          ),
      )
      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setURL(config.source)
            .setLabel("View Source"),
        ),
      )
      .addSeparatorComponents((separator) =>
        separator.setDivider(true).setSpacing(SeparatorSpacingSize.Large),
      )
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              [
                "## About NICS",
                "NICS is a student-led, non-profit technology community for high school students in Nepal. We’re a place to learn, build, and compete—through workshops, projects, competitions, mentorship, and collaboration.",
                "Whether you’re already into programming or just curious about technology, NICS is about giving students the space and resources to explore, create, and grow together.",
              ].join("\n"),
            ),
          )
          .setThumbnailAccessory((thumbnail) =>
            thumbnail.setURL("attachment://nics.jpeg"),
          ),
      )
      .addSeparatorComponents((separator) =>
        separator.setDivider(true).setSpacing(SeparatorSpacingSize.Large),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          [
            "### Useful Links",
            `\`🌐\` [Website](${config.website})`,
            `\`🗒️\` [Application Form](${config.applicationForm})`,
          ].join("\n"),
        ),
      )
      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Website")
            .setURL(config.website),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Application Form")
            .setURL(config.applicationForm),
        ),
      )
      .addSeparatorComponents((separator) =>
        separator.setDivider(false).setSpacing(SeparatorSpacingSize.Small),
      )
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          [
            "### Socials",
            "Follow us on our social media to know the happenings of the club!",
          ].join("\n"),
        ),
      )
      .addActionRowComponents((row) =>
        row.addComponents(
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Instagram")
            .setURL(config.social.instagram),
          new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("Facebook")
            .setURL(config.social.facebook),
        ),
      );

    await interaction.editReply({
      components: [component],
      files: [nicsCircle],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}
