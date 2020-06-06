class Vue {
    constructor(options = {}) {
        this.$el = options.el;
        let data = (this.data = options.data);
        Object.keys(data).forEach((key) => {
            this.proxyData(key);
        });
        this.observerData(data);
    }
    proxyData(key) {
        let that = this;
        Object.defineProperty(that, key, {
            configurable: false,
            enumerable: true,
            get() {
                return that.data[key];
            },
            set(newVal) {
                that.data[key] = newVal;
            },
        });
    }
    observerData(data) {
        let that = this;
        Object.keys(data).forEach((key) => {
            let val = data[key];
            Object.defineProperty(data, key, {
                configurable: false,
                enumerable: true,
                get() {
                    return val;
                },
                set(newVal) {
                    if (val !== newVal) {
                        val = newVal;
                        that.notify(key);
                    }
                },
            });
        });
    }
    notify(key) {
        console.log(`data.${key} changed => ${this.data[key]}`);
    }
}

let mv = new Vue({
    data: {
        name: "zyp",
        age: 29,
    },
});

console.log(`my name => ${mv.name}, my age => ${mv.age}`);
setTimeout(() => {
    mv.name = "loveuer";
}, 1000);
