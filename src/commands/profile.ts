import {
  ChatInputCommandInteraction,
  Colors,
  ContainerBuilder,
  GuildMember,
  MessageFlags,
  SeparatorSpacingSize,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../core/command.js";

export default class ProfileCommand extends Command {
  public override name: string = "profile";
  public override usage: string = "/profile [user]";
  public override data = new SlashCommandBuilder()
    .setDescription("View your profile.")
    .addUserOption((option) =>
      option.setName("user").setDescription("Target user").setRequired(false),
    );

  public override async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const targetUser = interaction.options.getUser("user") ?? interaction.user;
    const member = await interaction.guild?.members.fetch(targetUser.id);
    if (!member) return;

    const role = await getUserTitle(member);
    const badges = getBadges(member);
    const department = getDepartment(member);

    const component = new ContainerBuilder()
      .setAccentColor(Colors.Grey)
      .addSectionComponents((section) =>
        section
          .addTextDisplayComponents((textDisplay) =>
            textDisplay.setContent(
              [
                `## User Profile`,
                `**${interaction.user.displayName} ${interaction.user.displayName !== member.displayName ? `(${member.displayName})` : ""}**`,
                `${role}${department ? `\n${department}` : ""}`,
                `> Part of NICS since ${new Date(
                  member.joinedTimestamp ?? 0,
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}`,
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
      .addTextDisplayComponents((textDisplay) =>
        textDisplay.setContent(
          ["### Badges", badges.length > 0 ? [...badges] : "None"].join("\n"),
        ),
      );
    await interaction.reply({
      components: [component],
      flags: MessageFlags.IsComponentsV2,
    });
  }
}

const getUserTitle = async (member: GuildMember) => {
  const highestRole = member.roles.highest;
  return highestRole.name;
};

const getBadges = (member: GuildMember) => {
  const badges = [];

  if (member.roles.cache.has("1525564244777767013")) {
    badges.push("`🌟` Early Supporter");
  }

  return badges;
};

const getDepartment = (member: GuildMember) => {
  const departmentTable = {
    "1525395468564168714": "Executive Board Member",
    "1533111240551956612": "Editorial Department",
    "1525890467261055127": "Honorary Member",
  } as const;

  for (let roleId in departmentTable) {
    if (member.roles.cache.has(roleId))
      return departmentTable[roleId as keyof typeof departmentTable];
  }

  return null;
};
