// /////////////////////////////////////////////////////////////////////////////
// TESTING AREA
// THIS IS AN AREA WHERE YOU CAN TEST YOUR WORK AND WRITE YOUR OWN TESTS
// /////////////////////////////////////////////////////////////////////////////

import request from 'supertest';
import '@babel/polyfill';
import api from '../src/api';
import db from '../src/db'
import models from '../src/db/model'

describe('update player api', () => {
  beforeEach(async () => {
    await db.sync();
    
  });

  afterEach(async () => {
    await models.Player.destroy({
      where: {},
      truncate: true,
      restartIdentity: true
    });

    await models.PlayerSkill.destroy({
      where: {},
      truncate: true,
      restartIdentity: true
    });

    await db.query('DELETE FROM `sqlite_sequence` WHERE `name` = "players"');
    await db.query('DELETE FROM `sqlite_sequence` WHERE `name` = "playerSkills"');
  });

  it('test sample', async () => {
    const data = {
      "name": "player name updated",
      "position": "midfielder",
      "playerSkills": [
        {
          "skill": "strength",
          "value": 40
        },
        {
          "skill": "stamina",
          "value": 30
        }
      ]
    };

    await request(api).post('/api/player').send(data);
    const response = await request(api).put('/api/player/1').send(data);

    expect(response).not.toBeNull();
  });
});