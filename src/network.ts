/* eslint-disable @typescript-eslint/camelcase */
import { QueryArrayResult } from 'pg';
import { Message } from 'discord.js';
import * as _ from 'lodash';
import axios from 'axios';
import query from './db/PostgresPool';

const initializeDatabase = async () => {
  await query(
    `CREATE TABLE IF NOT EXISTS drinks (
              "id" SERIAL primary key, 
              "username" varchar(450) NOT NULL,  
              "guild" varchar(450) NOT NULL,
              "drinkname" varchar (100) NOT NULL,
              "active" boolean
            )`
  );
};

const addDrink = async (username: string, guildId: string, drinkName: string) => {
  try {
    await query(
      `INSERT INTO drinks (username, guild, drinkname, active) values ('${username}', '${guildId}', '${drinkName}', true)`
    );
  } catch (error) {
    throw new Error(error);
  }
};

const getDrinkCount = async (message: Message): Promise<QueryArrayResult> => {
  try {
    const response = await query(
      `SELECT * FROM drinks where guild = '${message.guild.id}' and active = true`,
      []
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const getDrinksForGuild = async (message: Message) => {
  try {
    const response = await query(
      `SELECT * FROM drinks where guild = '${message.guild.id}' and active = true`,
      []
    );
    return response.rows;
  } catch (error) {
    throw new Error(error);
  }
};

const clearDrinksForGuild = async (message: Message) => {
  try {
    const response = await query(
      `UPDATE drinks SET active = false WHERE guild = '${message.guild.id}'`
    );
    return response;
  } catch (error) {
    throw new Error(error);
  }
};

const getBeerInformation = async (beerName: string) => {
  const response = await axios.get('https://api.untappd.com/v4/search/beer', {
    params: {
      client_id: F20781FA80B8B85F2DC1DB380FADE5B416D324DC,
      client_secret: 208C92E4238DE3AE10B681A28FF542AF9E42A520
      q: beerName,
    },
  });
  return response.data.response.beers.items[0].beer;
};

export {
  initializeDatabase,
  addDrink,
  getDrinkCount,
  getDrinksForGuild,
  clearDrinksForGuild,
  getBeerInformation,
};
