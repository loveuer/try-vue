import { Depend } from "./depend.js";

class Observer {
    constructor() {}
}

export function _observer(data) {
    Object.keys(data).forEach((key) => {
        let val = data[key];
        let dep = new Depend();
        Object.defineProperty(data, key, {
            configurable: false,
            enumerable: true,
            get() {
                dep.depend();
                return val;
            },
            set(newVal) {
                if (newVal !== val) {
                    val = newVal;
                }
            },
        });
    });
}
