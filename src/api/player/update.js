// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import Player from "../../db/model/player";
import PlayerSkill from "../../db/model/playerSkill";
import sequelize from "sequelize";

export default async (req, res) => {
  try {
    const playerId = req.params.id;
    const { name, position, playerSkills } = req.body;
  
    // Validate the player data
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
  
    // Find the player record to update
    const player = await Player.findByPk(playerId);
  
    if (!player) {
      throw new sequelize.ValidationError(`Player with id ${playerId} not found`);
    }
  
    // Update the player record
    await player.update({ name, position });
  
    // Delete the existing player skills records
    await PlayerSkill.destroy({ where: { playerId } });
  
    // Create the new player skills records
    await Promise.all(playerSkills.map(skill =>
      PlayerSkill.create({ skill: skill.skill, value: skill.value, playerId: player.id })
    ));
  
    // Eagerly load the player skills records
    await player.reload({
      include: [{ model: PlayerSkill }]
    });
  
    // Return the updated player record
    res.json(player);
  } catch (error) {
    console.error(error);
    if (error instanceof sequelize.ValidationError) {
      return res.status(400).json({ message: error.message });
    }
    console.error(error);
    res.sendStatus(500);
  }
}
