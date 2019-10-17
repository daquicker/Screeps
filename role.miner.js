var roleMiner = {

    run: function (creep) {
        let source = Game.getObjectById(creep.memory.sourceID);
        let container = Game.getObjectById(creep.memory.containerID);
        if (!creep.pos.isEqualTo(container.pos)) {
            creep.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 1 });
        }
        else {
            creep.harvest(source);
        }
    }
};

module.exports = roleMiner;