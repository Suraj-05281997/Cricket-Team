const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");


const dbPath = path.join(__dirname, "cricketTeam.db");
const app = express();
app.use(express.json());
let db = null;

const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () =>
        console.log("success"));
  } catch (e) {
    console.log(`Db error ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
    return {
        playerId : dbObject.player_id;
        playerName : dbObject.player_name;
        jerseyNumber : dbObject.jersey_number;
        role : dbObject.role,
    };
};

app.get("/players/", async (request,response) => {
    const getPlayersQuery = `
        SELECT
          *
        FROM
           cricket_team;`;
    const playersArray = await db.all(getPlayersQuery);
    response.send(playersArray.map((eachPlayer) =>
            convertDbObjectToResponseObject(eachPlayer)
         )
    );        
});

app.post("/players/", async(request, response) => {
    const { playerName, jerseyNumber, role } = request.body;
    const postPlayerQuery = `
        INSERT INTO
        cricket_team (player_name, jersey_number, role)
        VALUES
             (
               '${playerName}',
               '${jerseyNumber}',
               '${role}');`;
    const player = await db.run(postPlayerQuery);
    response.send("Player Added To Team");
});

app.get("/players/:playerId/", async (request,response) => {
    const { playerId } = request.params;
    const getPlayerQuery = `
       SELECT
         *
       FROM
          cricket_team
       WHERE
          player_id = ${playerId};`;
    const player = await db.get(getPlayerQuery);
    response.send(convertDbObjectToResponseObject(player));
});

app.put("/players/:playerId/" , async (request,response) => {
    const { playerId } = request.params;
    const details = request.body;
    const { playerName, jerseyNumber, role } = details;
    const updatePlayerQuery = `
         UPDATE
             cricket_team
         SET
            player_name = '${playerName}',
            jersey_number = '${jerseyNumber}',
            role = '${role}'
        WHERE
            player_id = ${playerId};`;

     await db.run(updatePlayerQuery);
     response.send("Player Details Updated");
});

app.delete("/players/:playerId/", async (request,response) => {
    const { playerId } = request.params;
    const deletePlayerQuery = `
         DELETE FROM
             cricket_team
         WHERE
             player_id =  ${playerId};`;
    await db.run(deletePlayerQuery);
    response.send("player Removed");
});

module.exports = app;