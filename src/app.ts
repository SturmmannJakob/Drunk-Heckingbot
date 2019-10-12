import Discord, { RichEmbed } from "discord.js";
import * as _ from "lodash";
import {
  initializeDatabase,
  addDrink,
  getDrinkCount,
  getDrinksForGuild,
  clearDrinksForGuild,
  getBeerInformation
} from "./network";
import { commands } from "./utils/constants";
import { messageFormatter } from "./utils/helpers";
require("dotenv").config();

export class App {
  client: Discord.Client;

  constructor(client: Discord.Client) {
    this.client = client;
  }

  public readyHandler() {
    console.log("I am alive and well!");
    initializeDatabase();
  }

  public async cheersHandler(message: Discord.Message) {
    let drinkName = message.content.replace("!cheers", "").trimLeft();

    if (drinkName.length === 0) {
      message.channel.send(
        "You can't cheers with an empty glass! Add the name of what you're drinking after you !cheers"
      );
    } else {
      addDrink(message, drinkName);
      message.channel.send("Enjoy that brewchacho, brochacho. 🍺");
    }
  }

  public async drinkCountHandler(message: Discord.Message) {
    try {
      const drinkCount = await getDrinkCount(message);
      message.channel.send(
        `${drinkCount} drink(s) have been consumed by the server! 🍻🥃`
      );
    } catch (error) {
      console.log("Error fetching drink count", error);
      message.channel.send(`An error occurred fetching your drinks :(. `);
    }
  }

  public async whoIsDrunkHandler(message: Discord.Message) {
    try {
      const people = await getDrinksForGuild(message);
      const drinksByUserName = _.groupBy(people, "username");
      if (people.length === 0) {
        message.channel.send(
          "Nobody is drunk because nobody has had anything to drink! 🏝️"
        );
      } else {
        message.channel.send(messageFormatter(drinksByUserName));
      }
    } catch (error) {
      console.log("Error fetching who is drunk", error);
      message.channel.send(
        `An error occurred while figuring out who is drunk :(.`
      );
    }
  }

  public async resetBotHandler(message: Discord.Message) {
    try {
      await clearDrinksForGuild(message);
      message.channel.send(
        "All drinks have been cleared. Thanks for drinking with me! 🥃"
      );
    } catch (error) {
      console.log(error);
    }
  }

  public helpHandler(message: Discord.Message) {
    let embed = new RichEmbed()
      .setTitle("Drunkcord Help")
      .setColor(0xff0000)
      .setThumbnail("https://i.imgur.com/gaf3cVL.png")
      .setDescription(commands);
    message.channel.send(embed);
  }

  public async beerHandler(message: Discord.Message) {
    let drinkName = message.content.replace("!beers", "").trimLeft();
    if (drinkName.length === 0) {
      message.channel.send(
        "You can't raise a beer without providing a name! Make sure to include the name of the beer you're drinking after !beers"
      );
      return;
    }
    try {
      const data = await getBeerInformation(drinkName);
      await addDrink(message, data.beer_name);
      const fancyBeerMessage = new RichEmbed()
        .setAuthor(`It looks like you're drinking a ${data.beer_name}!`)
        .setTitle("Let me tell you about that beer!")
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
      console.log(error);
      try {
        await addDrink(message, drinkName);
        let embed = new RichEmbed()
          .setTitle("Oh no!")
          .setColor(0xff0000)
          .setThumbnail("https://i.imgur.com/gaf3cVL.png")
          .setDescription(
            `I can't find any information about that beer! I'm so sorry to have let you down :(.)`
          );
        message.channel.send(embed);
      } catch (error) {
        console.log("Error adding drink:", error);
        message.channel.send(`An error occurred while adding this drink :(.`);
      }
    }
  }
}
