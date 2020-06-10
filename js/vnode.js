export function _createVNode(_vm, el) {
    let rootVNode = new VNode({
        vm: _vm,
        tag: el.tagName,
        el: el,
        parent: { el: el.parentNode },
    });
    _generateVNode(_vm, el, rootVNode);
    console.log(el);

    let elChilds = el.childNodes;
    for (let i = elChilds.length - 1; i >= 0; i--) {
        el.removeChild(elChilds[i]);
    }

    console.log("new el ->", el);
    return rootVNode;
}
export function _mount(vnode, root = false) {
    if (!root) vnode.mount();
    if (vnode.children.length > 0) {
        vnode.children.forEach((cn) => {
            _mount(cn);
        });
    }
}

function _generateVNode(_vm, el, parentVNode) {
    if (el.nodeType === 1) {
        let pv = new VNode({
            vm: _vm,
            tag: el.tagName,
            parent: parentVNode,
            attrs: {}, // <-- complete later
        });
        parentVNode.children.push(pv);
        let nodes = el.childNodes;

        for (let i = 0; i < nodes.length; i++) {
            _generateVNode(_vm, nodes[i], pv);
        }
    } else if (el.nodeType === 3) {
        let nvn;
        let reg = /\{\{(.+)?\}\}/g;
        let txt = el.textContent;
        if (reg.test(txt)) {
            nvn = new VNode({
                vm: _vm,
                tag: "textNode",
                parent: parentVNode,
            });
            txt = txt.slice(2, txt.length - 2).trim();
            let val = _vm.$data[txt];
            nvn.attrs["textContent"] = val;
        } else {
            nvn = new VNode({
                vm: _vm,
                tag: "textNode",
                parent: parentVNode,
                attrs: { textContent: txt },
            });
        }
        parentVNode.children.push(nvn);
    }
}
function _removeNode(node) {
    if (node.nodeType === 3) {
        node.remove();
    } else if (node.nodeType === 1) {
        let nodes = node.childNodes;
        for (let i = 0; i < nodes.length; i++) {
            _removeNode(nodes[i]);
        }
        node.remove();
    }
}

class VNode {
    constructor(options) {
        this.vm = options.vm || null;
        this.el = options.el || null;
        this.tag = options.tag;
        this.parent = options.parent || null;
        this.children = options.children || [];
        this.attrs = options.attrs || {};
    }
    compile() {}
    mount() {
        if (this.tag === "textNode") {
            let newTextNode = document.createTextNode(this.attrs.textContent);
            this.parent.el.appendChild(newTextNode);
            this.el = newTextNode;
        } else {
            let newNode = document.createElement(this.tag);
            this.parent.el.appendChild(newNode);
            this.el = newNode;
        }
    }
}
