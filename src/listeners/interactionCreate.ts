import {
  ButtonInteraction,
  type CacheType,
  Colors,
  EmbedBuilder,
  type Interaction,
} from "discord.js";
import { Listener } from "../core/listener.js";

export default class InteractionCreate extends Listener<"interactionCreate"> {
  public name: string = "interactionCreate";
  public event: "interactionCreate" = "interactionCreate";
  public once: boolean = false;

  public async execute(interaction: Interaction<CacheType>): Promise<void> {
    if (interaction.isButton()) {
      return await handleButtonInteraction(interaction);
    }
  }
}

const handleButtonInteraction = async (
  interaction: ButtonInteraction<CacheType>,
) => {
  if (interaction.customId.startsWith("trivia:")) {
    const oldEmbed = interaction.message.embeds[0];

    if (!oldEmbed) return;

    const [_, optionIndex, correctIndex] = interaction.customId.split(":");

    if (optionIndex === correctIndex) {
      const description = oldEmbed.description
        ?.split("\n")
        .map((t, i) => {
          if (i !== Number(correctIndex)) {
            return `~~${t}~~`;
          }
          return `**${t}** -> *Correct answer*`;
        })
        .join("\n");

      const newEmbed = EmbedBuilder.from(oldEmbed)
        .setColor(Colors.Green)
        .setDescription(`You're Correct!\n\n${description}`);

      await interaction.update({
        embeds: [newEmbed],
        components: [],
      });
      return;
    }
    const splittedDesc = oldEmbed.description?.split("\n");

    const description = splittedDesc
      ?.map((t, i) => {
        if (i !== Number(correctIndex)) {
          return `~~${t}~~`;
        }
        return `**${t}** -> *Correct answer*`;
      })
      .join("\n");

    const newEmbed = EmbedBuilder.from(oldEmbed)
      .setColor(Colors.Red)
      .setDescription(
        `Nope, you got it wrong :(\n\n${description}\n\n*Your answer: ${splittedDesc?.[Number(optionIndex)]}*\n`,
      );

    await interaction.update({
      embeds: [newEmbed],
      components: [],
    });
    return;
  }
};
