var constrRoads = {

    init: function (spawn, sourceIDs) {
        let sources = []
        for (let sourceID of sourceIDs) {
            sources.push(Game.getObjectById(sourceID));
        }
        for (let source of sources) {
            let path = spawn.pos.findPathTo(source.pos, { range: 1, swampCost: 1, ignoreCreeps: 1 });
            for (let tile of path) {
                spawn.room.createConstructionSite(tile.x, tile.y, STRUCTURE_ROAD);
            }
        }
    },

    repeat: function (traversed, traversedCount, spawn) {
        // Turn array of objects into array of strings for sorting
        console.log('Check roadbuilding');
        for (let ind = 0; ind < traversedCount; ind++) {
            traversed[ind] = JSON.stringify(traversed[ind]);
        }
        // Sort array of strings
        traversed.sort();
        // Compare each element of sorted 'traversed' array to the previous, add to counter if equal, if not execute logic depending on current counter and reset counter
        let count = 0;
        let prev = traversed[0];
        // Value above which a new road should be constructed
        let threshold = 25;
        for (let ind = 1; ind < traversedCount; ind++) {
            if (prev == traversed[ind]) {
                count++;
                prev = traversed[ind];
            }
            else {
                // If count above threshold, place construction site
                if (count > threshold) {
                    console.log('building road at: ', prev);
                    prev = JSON.parse(prev);
                    spawn.room.createConstructionSite(prev.x, prev.y, STRUCTURE_ROAD);
                }
                // Reset count and prev variables
                count = 0;
                prev = traversed[ind];
            }
        }
    }
};

module.exports = constrRoads;