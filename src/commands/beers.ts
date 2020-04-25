import { Command, CommandoClient, CommandMessage } from 'discord.js-commando';
import { getBeerInformation, addDrink } from '../network';
import { RichEmbed } from 'discord.js';
export class Beers extends Command {
  constructor(client: CommandoClient) {
    super(client, {
      name: 'beers',
      group: 'basic-commands',
      aliases: ['beer'],
      memberName: 'beers',
      description: `Tells you about the beer you're enjoying to Drunkcord!`,
      examples: ['!beers'],
      args: [
        {
          key: 'beerName',
          prompt:
            "You can't raise a beer without providing a name! Make sure to include the name of the beer you're drinking after !beers",
          type: 'string',
        },
      ],
    });
  }

  // @ts-ignore
  async run(message: CommandMessage, { beerName }: any) {
    try {
      const data = await getBeerInformation(beerName);
      const richBeerName = data.beer_name.replace(/'/g, '');
      const fancyBeerMessage = new RichEmbed()
        .setAuthor(`It looks like you're drinking a ${richBeerName}!`)
        .setTitle('Let me tell you about that beer!')
        .setFooter(
          `
          ABV: ${data.beer_abv}%
          Style: ${data.beer_style}
          `
        )
        .setColor(0xff0000)
        .setThumbnail(data.beer_label)
        .setDescription(data.beer_description);
      message.channel.send(fancyBeerMessage);
    } catch (error) {
      console.error('An error occurred while adding a drink', error);
    }
  }
}
