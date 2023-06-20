// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import Player from "../../db/model/player";
import PlayerSkill from "../../db/model/playerSkill";
import sequelize from "sequelize";

export default async (req, res) => {
  try {
    // Get the player ID from the request params
    const playerId = req.params.id;

    // Find the player record to delete
    const player = await Player.findByPk(playerId);

    if (!player) {
      throw new sequelize.ValidationError(`Player with id ${playerId} not found`);
    }

    // Check for a valid Bearer token in the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      throw new sequelize.ValidationError('Authorization header is missing');
    }

    const token = authHeader.split(' ')[1];
    const expectedToken = 'SkFabTZibXE1aE14ckpQUUxHc2dnQ2RzdlFRTTM2NFE2cGI4d3RQNjZmdEFITmdBQkE=';

    if (token !== expectedToken) {
      throw new sequelize.ValidationError('Invalid or expired token');
    }

    // Delete the player skills records associated with the player
    await PlayerSkill.destroy({ where: { playerId } });

    // Delete the player record
    await player.destroy();

    // Return a success message
    res.json({ message: `Player with id ${playerId} deleted` });
  } catch (error) {
    if (error instanceof sequelize.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.sendStatus(500);
  }
}
