// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import Player from "../../db/model/player";
import PlayerSkill from "../../db/model/playerSkill";
import sequelize from "sequelize";

export default async (req, res) => {
  try {
    const { name, position, playerSkills } = req.body;

    // Validate request body
    if (!name || !position || !playerSkills || !Array.isArray(playerSkills)) {
      throw new sequelize.ValidationError('Invalid request body');
    }

    // Validate position
    if (!['defender', 'midfielder', 'forward'].includes(position)) {
      throw new sequelize.ValidationError(`Invalid value for position: ${position}`);
    }

    // Validate playerSkills
    for (const skill of playerSkills) {
      if (!['defense', 'attack', 'speed', 'strength', 'stamina'].includes(skill.skill)) {
        throw new sequelize.ValidationError(`Invalid value for player skill: ${skill.skill}`);
      }
    }

    // Create a new player record in the database
    const newPlayer = await Player.create({
      name,
      position,
    });

    // Create new player skill records and associate them with the player
    for (const skill of playerSkills) {
      await PlayerSkill.create({
        skill: skill.skill,
        value: skill.value,
        playerId: newPlayer.id,
      });
    }

    const createdPlayer = await Player.findOne({
      where: { id: newPlayer.id },
      include: { model: PlayerSkill },
    });

    res.json(createdPlayer);
  } catch (error) {
    if (error instanceof sequelize.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.sendStatus(500);
  }
}