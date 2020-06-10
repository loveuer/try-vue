import { _proxy } from "./proxy.js";
import { _observer } from "./observer.js";
import { _createVNode, _mount } from "./vnode.js";

class Vue {
    constructor(options = {}) {
        this.$el = document.querySelector(options.el);
        this.$data = options.data;
        _proxy(this, this.$data);
        _observer(this.$data);
        this.$vnode = _createVNode(this, this.$el);
        _mount(this.$vnode, true);
    }
}

let mv = new Vue({
    el: "#container",
    data: {
        welcome: "welcome to loveUer",
        name: "zyp",
        age: 29,
    },
});

mv.name = "loveuer";
