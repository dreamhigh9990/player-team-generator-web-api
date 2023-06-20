// ---------------------------------------------------------------------------------------------
// YOU CAN FREELY MODIFY THE CODE BELOW IN ORDER TO COMPLETE THE TASK
// ---------------------------------------------------------------------------------------------

import Player from "../../db/model/player";
import PlayerSkill from "../../db/model/playerSkill";

export default async (req, res) => {
  try {
    const requirements = req.body;

    // Validate request body
    if (!Array.isArray(requirements) || requirements.length === 0) {
      res.status(400).json({ message: "Invalid request body" });
      return;
    }

    const selectedPlayers = await selectBestPlayers(requirements);
    if (selectedPlayers.error) {
      res.status(400).json({
        message: await selectedPlayers.error,
      });
      return;
    }

    const result = selectedPlayers.map((player) => ({
      name: player.name,
      position: player.position,
      playerSkills: player.playerSkills.map((skill) => ({
        skill: skill.skill,
        value: skill.value,
      })),
    }));

    res.json(result);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
};

const selectPlayersForRequirement = async (position, mainSkill, numberOfPlayers) => {
  // Find all players with the given position and main skill
  const players = await Player.findAll({
    where: { position },
    include: [{ model: PlayerSkill }],
    order: [[PlayerSkill, 'value', 'DESC']],
  });

  let selectedPlayers = [];
  let otherSkillPlayers = [];

  // Select the required number of players with the desired main skill
  let i = 0;
  while (selectedPlayers.length < numberOfPlayers && i < players.length) {
    const player = players[i];
    let hasMainSkill = false;
    for (const skill of player.playerSkills) {
      if (skill.skill === mainSkill) {
        hasMainSkill = true;
        selectedPlayers.push(player);
      }
    }
    if (!hasMainSkill) {
      otherSkillPlayers.push(player);
    }
    i++;
  }

  // If there are not enough players with the desired main skill, select players with the highest skill value in other skills
  if (selectedPlayers.length < numberOfPlayers) {
    // Select the remaining required number of players from the players with the highest skill value in other skills
    let j = 0;
    while (selectedPlayers.length < numberOfPlayers && j < otherSkillPlayers.length) {
      const player = otherSkillPlayers[j];
      if (!selectedPlayers.includes(player)) {
        selectedPlayers.push(player);
      }
      j++;
    }
  }

  // If there are still not enough players, return an empty array
  if (selectedPlayers.length < numberOfPlayers) {
    return [];
  }

  return selectedPlayers;
};

const selectBestPlayers = async (requirements) => {
  // Create an object to keep track of the selected players for each position and skill combination
  const selectedPlayers = {};

  // Loop through the requirements and find the best player for each position and skill combination
  for (const requirement of requirements) {
    const { position, mainSkill, numberOfPlayers } = requirement;

    // Check if the same position and skill combination has already been selected
    if (selectedPlayers[position] && selectedPlayers[position][mainSkill]) {
      return { error: `Duplicate requirement for ${position} with ${mainSkill}` };
    }

    // Select the players for the current requirement
    const selectedPlayersForRequirement = await selectPlayersForRequirement(position, mainSkill, numberOfPlayers);

    // Check if there are enough players available for the requirement
    if (selectedPlayersForRequirement.length < numberOfPlayers) {
      return { error: `Insufficient number of players for position: ${position}` };
    }

    // Add the selected players to the selected players list
    if (!selectedPlayers[position]) {
      selectedPlayers[position] = {};
    }

    selectedPlayers[position][mainSkill] = selectedPlayersForRequirement;
  }

  // Flatten the selected players list and return the result
  const selectedPlayersList = Object.values(selectedPlayers).flatMap((positions) =>
    Object.values(positions).flatMap((players) => players)
  );

  return selectedPlayersList;
}