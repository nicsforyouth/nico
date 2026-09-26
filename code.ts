    const nicsCircle = new AttachmentBuilder("./assets/nics-circle.png");

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
            thumbnail.setURL(interaction.user.avatarURL() ?? ""),
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
            thumbnail.setURL("attachment://nics-circle.png"),
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
      );

    await interaction.editReply({
      components: [component],
      files: [nicsCircle],
    });

