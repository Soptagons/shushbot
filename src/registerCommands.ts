import type { Client } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export async function registerCommands(client: Client) {
  const guild = client.guilds.cache.get('your server id here');
  if (!guild) return;

  const commands = [
    new SlashCommandBuilder()
      .setName('join')
      .setDescription('Joins the voice channel that you are in')
      .toJSON(),
    new SlashCommandBuilder()
      .setName('shush')
      .setDescription('Enables recording for a user')
      .addUserOption(option => 
        option.setName('speaker')
              .setDescription('The user to shush')
              .setRequired(true)
      )
      .toJSON(),
    new SlashCommandBuilder()
      .setName('leave')
      .setDescription('Leave the voice channel')
      .toJSON(),
  ];

  await guild.commands.set(commands);
}
