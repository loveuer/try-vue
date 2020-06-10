class Vue {
    constructor(options = {}) {
        this.$data = options.data;
        this._proxyData(this.$data);
        this._observerData(this.$data);
    }
    _proxyData(data) {
        Object.keys(data).forEach((key) => {
            Object.defineProperty(this, key, {
                configurable: false,
                enumerable: true,
                get() {
                    return data[key];
                },
                set(newVal) {
                    data[key] = newVal;
                },
            });
        });
    }
    _observerData(data) {
        Object.keys(data).forEach((key) => {
            let dep = { update: null };
            let val = data[key];
            Object.defineProperty(data, key, {
                configurable: false,
                enumerable: true,
                get() {
                    console.log("get...");
                    dep.update = Watcher.stack.pop();
                    return val;
                },
                set(newVal) {
                    if (newVal !== val) {
                        val = newVal;
                        dep.updata();
                    }
                },
            });
        });
    }
}

let mv = new Vue({
    data: {
        name: "zyp",
        age: 29,
    },
});

class VNode {
    constructor(options) {
        this.attrs = options.attrs || {};
    }
}

let rv = new VNode({
    attrs: {
        textContent: () => {
            return mv.name;
        },
    },
});

console.log(rv);
