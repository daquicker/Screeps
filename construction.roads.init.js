var constrRoads = {

    run: function (spawn) {
        var sources = Game.spawns[spawn].room.find(FIND_SOURCES);
        for (let indS in sources) {
            let source = sources[indS];
            var path = Game.spawns[spawn].pos.findPathTo(source.pos, { range: 1, swampCost: 1, ignoreCreeps: 1 });
            for (let indP in path) {
                let tile = path[indP];
                Game.spawns[spawn].room.createConstructionSite(tile.x, tile.y, STRUCTURE_ROAD);
            }
        }
    }
};

module.exports = constrRoads;