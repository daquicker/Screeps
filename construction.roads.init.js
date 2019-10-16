var constrRoads = {

    run: function (spawn, sourceIDs) {
        var sources = []
        for (let sourceID of sourceIDs) {
            sources.push(Game.getObjectById(sourceID));
        }
        for (let source of sources) {
            var path = spawn.pos.findPathTo(source.pos, { range: 1, swampCost: 1, ignoreCreeps: 1 });
            for (let tile of path) {
                spawn.room.createConstructionSite(tile.x, tile.y, STRUCTURE_ROAD);
            }
        }
    }
};

module.exports = constrRoads;