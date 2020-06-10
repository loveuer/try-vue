export function _proxy(vm, data) {
    Object.keys(data).forEach((key) => {
        Object.defineProperty(vm, key, {
            enumerable: true,
            configurable: false,
            get() {
                return data[key];
            },
            set(newVal) {
                data[key] = newVal;
            },
        });
    });
}
