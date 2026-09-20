import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";
import { Command } from "../core/command.js";
import ky from "ky";
import he from "he";

const difficultyChoices = [
  {
    name: "Easy",
    value: "easy",
  },
  {
    name: "Medium",
    value: "medium",
  },
  {
    name: "Hard",
    value: "hard",
  },
];
const typeChoices = [
  {
    name: "True/False",
    value: "boolean",
  },
  {
    name: "Multiple Choice",
    value: "multiple",
  },
];

type Difficulty = "easy" | "medium" | "hard";

type TriviaResult = {
  type: "boolean" | "multiple";
  difficulty: Difficulty;
  category: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
};

const optionsMap: Record<number, string> = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
} as const;

export default class Trivia extends Command {
  public name = "trivia";
  public data = new SlashCommandBuilder()
    .setDescription("Test your computer knowledge")
    .addStringOption((option) =>
      option
        .setName("difficulty")
        .setDescription("Difficulty of the question")
        .setChoices(difficultyChoices),
    )
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("Type of question")
        .setChoices(typeChoices),
    );

  public async execute(
    interaction: ChatInputCommandInteraction,
  ): Promise<void> {
    const difficulty = interaction.options.getString("difficulty");
    const type = interaction.options.getString("type");

    /*
     * @api
     * 18 --> Science: Computers
     * 30 --> Science: Gadgets
     */
    const categoryId = [18, 30][Math.floor(Math.random() * 2)];

    const url = `https://opentdb.com/api.php?amount=1&category=${categoryId}${difficulty ? `&difficulty=${difficulty}` : ""}${type ? `&type=${type}` : ""}`;

    const res = await ky.get(url).catch(async () => {
      await interaction.reply(
        `**Slow down!** Please try again <t:${Math.floor(Date.now() / 1000) + 5}:R>`,
      );
      setTimeout(async () => {
        await interaction.deleteReply();
      }, 6500);
    });

    if (!res) return;

    const resJSON = await res.json<{
      response_code: number;
      results: TriviaResult[];
    }>();

    if (resJSON.response_code == 5) {
      await interaction.reply(
        `**Slow down!** Please try again <t:${Math.floor(Date.now() / 100) + 5}:R>`,
      );
    }

    const trivia = resJSON.results[0];

    if (!trivia) return;

    const optionsCount = trivia.incorrect_answers.length + 1; // +1 for correct answer
    const options = [];
    let correctOptionIndex = 3; /* Default 3 to balance out the chances of 1/N% never occuring

    /* Populate options: Correct option has a 1/N% chance of being inserted on each iteration out of N iterations */
    for (let i = 0; i < optionsCount; i++) {
      if (Math.random() < 1 / optionsCount) {
        correctOptionIndex = options.length;
        options.push(trivia.correct_answer, ...trivia.incorrect_answers);
        break;
      }
      options.push(trivia.incorrect_answers.shift() ?? trivia.correct_answer);
    }

    const embed = new EmbedBuilder()
      .setTitle(`Q: ${he.decode(trivia.question)}`)
      .setDescription(
        options.map((opt, i) => `${optionsMap[i]}. ${opt}`).join("\n"),
      )
      .setFooter({
        text: `${trivia.difficulty} difficulty`,
      });

    const buttons = new Array<ButtonBuilder>(optionsCount)
      .fill(new ButtonBuilder())
      .map((_, i) => {
        return new ButtonBuilder()
          .setCustomId(`trivia:${i}:${correctOptionIndex}`)
          .setLabel(optionsMap[i] ?? "")
          .setStyle(ButtonStyle.Secondary);
      });

    const component = new ActionRowBuilder<ButtonBuilder>().setComponents(
      ...buttons,
    );

    await interaction.reply({
      embeds: [embed],
      components: [component],
    });
  }
}
