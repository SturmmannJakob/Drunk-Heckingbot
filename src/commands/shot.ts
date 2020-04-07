/* eslint-disable @typescript-eslint/no-misused-promises */
import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { Message, RichEmbed, User } from 'discord.js';
export class Shot extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'shot',
      group: 'basic-commands',
      memberName: 'shot',
      description: 'Call for a server-wide shot! Members can opt in to participate',
      examples: ['!shot'],
    });
  }

  //   TODO: the ts-ignore below sucks, but it might be necessary
  //   @ts-ignore
  async run(message: CommandMessage) {
    const embed = new RichEmbed().setTitle(`Let's take a shot!`)
      .setDescription(`${message.author} has request a group shot! React with an emoji to join!
      🥂: Participate in the shot\n
      ✅: We're ready to take a drink\n
      🚫: Cancel the group shot`);

    const sentMessage = (await message.say(embed)) as Message;
    await sentMessage.react(`🥂`);
    await sentMessage.react(`✅`);
    await sentMessage.react(`🚫`);

    const collector = sentMessage.createReactionCollector((reaction, user) => {
      return [`🥂`, `✅`].includes(reaction.emoji.name) && user.id === message.author.id;
    });

    collector.on('collect', async (collected) => {
      if (collected.emoji.name === `✅`) {
        const shotTakers = [];
        for (const messageReaction of collected.message.reactions.values()) {
          if (messageReaction.emoji.name === '🥂') {
            for (const user of messageReaction.users.values()) {
              if (!user.bot) {
                // only users should take shots. alcohol is bad for discord bots :)
                shotTakers.push(user);
              }
            }
          }
        }

        if (shotTakers.length) {
          this.countdownToShots(message, shotTakers);
          collector.stop();
        } else {
          await message.say(
            `It looks likes you're trying to take a group shot with...nobody! React with a 🥂 emoji to participate in the shot, or press 🚫 to cancel the shot!`
          );
        }
      }
    });

    collector.on('end', (collection) => {
      console.log(`Ending the shot collector's lifecycle`);
    });
  }

  async countdownToShots(message: CommandMessage, shotTakers: (User | undefined)[]) {
    // TODO: This is among the least creative code I've ever written
    // Either resolve all of these in one big promise, or use some recursion or something functional
    // Perhaps RX would do this? At the very least, let's use a setInterval followed by a setTimeout
    const sentMessage = (await message.say('Shot time!')) as Message;
    setTimeout(async () => {
      await sentMessage.edit('Time to take a shot in 5');
    }, 1000);

    setTimeout(async () => {
      await sentMessage.edit('Time to take a shot in 4');
    }, 2000);

    setTimeout(async () => {
      await sentMessage.edit('Time to take a shot in 3');
    }, 3000);

    setTimeout(async () => {
      await sentMessage.edit('Time to take a shot in 2');
    }, 4000);

    setTimeout(async () => {
      await sentMessage.edit('Time to take a shot in 1');
    }, 5000);

    setTimeout(async () => {
      try {
        await sentMessage.delete();
      } catch (error) {
        console.error('An error occurred while deleting the countdown message', error);
      }
      try {
        await message.say({
          embed: {
            color: 16777215,
            description: `Shot time! Drink up ${shotTakers}`,
            image: {
              //   TODO: Build a list of random gifs that are fun to take shots to
              url: 'https://media.giphy.com/media/xULW8JjyKvBKrIh2xy/giphy.gif',
            },
          },
        });
      } catch (error) {
        console.error('An error occurred while sending the take shot message', error);
        // TODO: Some generic error handling, preferably the built-in commando one
        await message.say(
          `Oh no! An error occurred while orchestrating that group shot! Maybe just take it anyways and pretend this little error never happened?`
        );
      }
    }, 6000);
  }
}