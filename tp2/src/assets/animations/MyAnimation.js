export class MyAnimation {
    constructor(id) {
        if (this.constructor == MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.isVisible = false;
        this.id = id;
        this.matrix = mat4.create();
        this.startTime = Number.MAX_SAFE_INTEGER;
        this.endTime = Number.MIN_SAFE_INTEGER;
    }

    update(t) {
        throw new Error("Method 'update()' must be implemented at the extending class.");
    }

    apply() {
        throw new Error("Method 'apply()' must be implemented at the extending class.");
    }
}