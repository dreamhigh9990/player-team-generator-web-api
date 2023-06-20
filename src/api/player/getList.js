// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import Player from "../../db/model/player";
import PlayerSkill from "../../db/model/playerSkill";

export default async (req, res) => {
  try {
    // Find all players and their associated player skills
    const players = await Player.findAll({
      include: [{ model: PlayerSkill }]
    });

    // Return the players in JSON format
    res.json(players);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
}
