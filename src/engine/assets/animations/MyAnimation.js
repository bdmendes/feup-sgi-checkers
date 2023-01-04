
/**
 * @export
 * @class MyAnimation bastract class
 */
export class MyAnimation {

    /**
     * Creates an instance of MyAnimation.
     * @param {*} id
     * @memberof MyAnimation
     */
    constructor(id) {
        if (this.constructor == MyAnimation) {
            throw new Error("Abstract classes can't be instantiated.");
        }

        this.isVisible = false;
        this.id = id;
        this.matrix = mat4.create();
    }


    /**
     * Throw an error if the method update() is not implemented at the extending class
     * @param {*} t
     * @memberof MyAnimation
     */
    update(t) {
        throw new Error("Method 'update()' must be implemented at the extending class.");
    }


    /**
     * Throw an error if the method apply() is not implemented at the extending class
     * @memberof MyAnimation
     */
    apply() {
        throw new Error("Method 'apply()' must be implemented at the extending class.");
    }
}
