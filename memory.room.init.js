var adjRoomNames = require('adjacent.room.names');
var memoryRoomInit = {

    run: function (spawnRoom, currentRoom) {
        // Set memory entries only needed in room with spawner
        if (spawnRoom) {
            // Initialize empty 'traversed' array in room memory if it doesn't exist yet
            if (!currentRoom.memory.traversed) {
                currentRoom.memory.traversed = [];
            }

            // Initialize 'traversedCount' integer in room memory if it doesn't exist yet
            if (!currentRoom.memory.traversedCount) {
                currentRoom.memory.traversedCount = 0;
            }

            // Set 'roomNameN' in room memory if it doesn't exist yet
            if (!currentRoom.memory.roomNameN) {
                currentRoom.memory.roomNameN = adjRoomNames.north(currentRoom);
            }

            // Set 'roomNameS' in room memory if it doesn't exist yet
            if (!currentRoom.memory.roomNameS) {
                currentRoom.memory.roomNameS = adjRoomNames.south(currentRoom);
            }

            // Set 'roomNameE' in room memory if it doesn't exist yet
            if (!currentRoom.memory.roomNameE) {
                currentRoom.memory.roomNameE = adjRoomNames.east(currentRoom);
            }

            // Set 'roomNameW' in room memory if it doesn't exist yet
            if (!currentRoom.memory.roomNameW) {
                currentRoom.memory.roomNameW = adjRoomNames.west(currentRoom);
            }

            // Set 'mainRoom' Boolean in room memory if it doesn't exist yet
            if (!currentRoom.memory.mainRoom) {
                currentRoom.memory.mainRoom = true;
            }
        }
        // Set memory entries needed in all rooms in (future) use
        // Initialize empty 'sourceContainerIDs' array in room memory if it doesn't exist yet
        if (!currentRoom.memory.sourceContainerIDs) {
            currentRoom.memory.sourceContainerIDs = [];
        }

        // Initialize empty 'reserveContainerIDs' array in room memory if it doesn't exist yet
        if (!currentRoom.memory.reserveContainerIDs) {
            currentRoom.memory.reserveContainerIDs = [];
        }

        // Initialize empty 'containerIDs' array in room memory if it doesn't exist yet
        if (!currentRoom.memory.containerIDs) {
            currentRoom.memory.containerIDs = [];
        }

        // Initialize 'containerCheckCount' integer in room memory if it doesn't exist yet
        if (!currentRoom.memory.containerCheckCount) {
            currentRoom.memory.containerCheckCount = 0;
        }

        // Set 'sourceIDs' array in room memory if it doesn't exist yet
        if (!currentRoom.memory.sourceIDs) {
            currentRoom.memory.sourceIDs = [];
            let sources = currentRoom.find(FIND_SOURCES);
            for (let ind in sources) {
                currentRoom.memory.sourceIDs.push(sources[ind].id);
            }
        }
    }
};

module.exports = memoryRoomInit;