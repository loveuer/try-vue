export class Depend {
    static activeUpdate = null;
    constructor() {
        this.dep = null;
    }
    depend() {
        if (Depend.activeUpdate) {
            this.dep = activeUpdate;
            this.dep = null;
        }
    }
    notify() {
        this.dep();
    }
}
