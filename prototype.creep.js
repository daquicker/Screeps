Creep.prototype.goWithdraw = function (containers) {
    let threshold = this.carryCapacity;
    let container = this.pos.findClosestByPath(containers, {
        filter: (container) => container.store[RESOURCE_ENERGY] >= threshold
    });
    // Try to withdraw if creep has long enough left to live
    if (this.withdraw(container, RESOURCE_ENERGY) != 0 && this.ticksToLive > 50) {
        this.moveTo(container, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 4 });
    }
};

Creep.prototype.goHarvest = function (sources) {
    let source = this.pos.findClosestByPath(sources);
    // Try to harvest and check if creep has long enough left to live
    if (this.harvest(source) != 0 && this.ticksToLive > 50) {
        this.moveTo(source, { visualizePathStyle: { stroke: '#ffaa00' }, reusePath: 2 });
    }
};