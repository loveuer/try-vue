class Vue {
    constructor(options = {}) {
        this.$el = document.querySelector(options.el);
        let data = (this.$data = options.data);
        this.watchTask = {};
        this.proxyData(data);
        this.observer(data);
        this.$methods = options.methods;
        this.compile(this.$el);

        // this.showAllData();
    }
    proxyData(data) {
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
    observer(data, prefix = []) {
        let keylist = [];
        let that = this;
        Object.keys(data).forEach((key) => {
            let value = data[key];
            if (typeof value === "object") {
                this.observer(value, prefix.concat([key]));
            }
            keylist = prefix.concat([key]);
            let nowkey = keylist.join(".");
            that.watchTask[nowkey] = that.watchTask[nowkey] || [];
            Object.defineProperty(data, key, {
                configurable: false,
                enumerable: true,
                get() {
                    return value;
                },
                set(newValue) {
                    if (newValue !== value) {
                        value = newValue;
                        that.noticeUpdata.call(that, nowkey);
                    }
                },
            });
        });
    }
    noticeUpdata(keyStr) {
        let keylist = keyStr.split(".");
        let data = this.$data;
        if (keylist.length > 0) {
            keylist.forEach((onekey) => {
                data = data[onekey];
            });
        }
        if (typeof data === "object") {
            this.noticeUpdateChildren(data, keylist);
            this.observer(data, keylist);
        } else {
            this.watchTask[keyStr].forEach((task) => {
                task.update(data);
            });
        }
    }
    noticeUpdateChildren(data, keylist) {
        // let that = this;
        if (typeof data === "object") {
            Object.keys(data).forEach((onekey) => {
                let od = data[onekey];
                this.noticeUpdateChildren(od, keylist.concat([onekey]));
            });
        } else {
            this.watchTask[keylist.join(".")].forEach((task) => {
                task.update(data);
            });
        }
    }
    compile(el) {
        el.childNodes.forEach((node) => {
            if (node.nodeType === 3) {
                this.compileText(node);
            } else if (node.nodeType === 1) {
                if (node.hasAttribute("v-for")) {
                    this.bindForLoop(node);
                } else {
                    // 循环调用 整个dom树
                    if (node.childNodes.length > 0) {
                        this.compile(node);
                    }
                    this.bindModel(node);
                    this.bindClick(node);

                    // 处理显示出来的内容
                    if (node.hasAttribute("v-html")) {
                        this.compileText(node, "innerHTML");
                        return;
                    } else if (node.hasAttribute("v-text")) {
                        this.compileText(node, "innerText");
                        return;
                    } else {
                        this.compileText(node);
                    }
                }
            }
        });
    }
    compileText(node, type) {
        let that = this;
        let dataKey;
        switch (type) {
            case "innerHTML":
                dataKey = node.getAttribute("v-html").trim();
                if (dataKey.includes(".")) {
                    let arrayKey = dataKey.split(".");
                    let renderData = this.$data;
                    arrayKey.forEach((oneKey) => {
                        renderData = renderData[oneKey];
                    });
                    node[type] = renderData;
                } else {
                    node[type] = this[dataKey];
                }
                // node[type] = this.$data[dataKey];
                that.watchTask[dataKey].push(new Watch(node, type));
                node.removeAttribute("v-html");
                break;
            case "innerText":
                dataKey = node.getAttribute("v-text").trim();
                if (dataKey.includes(".")) {
                    let arrayKey = dataKey.split(".");
                    let renderData = this.$data;
                    arrayKey.forEach((oneKey) => {
                        renderData = renderData[oneKey];
                    });
                    node[type] = renderData;
                } else {
                    node[type] = this[dataKey];
                }

                that.watchTask[dataKey].push(new Watch(node, type));
                node.removeAttribute("v-text");
                break;
            default:
                let reg = /\{\{(.*?)\}\}/g,
                    txt = node.textContent;
                if (reg.test(txt)) {
                    node.textContent = txt.replace(reg, (matched, dataKey) => {
                        dataKey = dataKey.trim();
                        let resultData;
                        if (dataKey.includes(".")) {
                            let arrayKey = dataKey.split(".");
                            let renderData = this.$data;
                            arrayKey.forEach((oneKey) => {
                                renderData = renderData[oneKey];
                            });
                            resultData = renderData;
                        } else {
                            resultData = this[dataKey];
                        }
                        that.watchTask[dataKey].push(
                            new Watch(node, "textContent")
                        );

                        return resultData;
                    });
                }
        }
    }
    bindModel(node) {
        let that = this;
        if (
            node.hasAttribute("v-model") &&
            (node.tagName === "INPUT" || node.tagName === "TEXTAREA")
        ) {
            let dataKey = node.getAttribute("v-model");
            node.value = this.$data[dataKey];
            node.addEventListener("input", () => {
                this.$data[dataKey] = node.value;
            });
            node.removeAttribute("v-model");
            this.watchTask[dataKey].push(new Watch(node, "value"));
        }
    }
    bindClick(node) {
        if (node.hasAttribute("@click")) {
            let attr = node.getAttribute("@click");
            node.removeAttribute("@click");
            let { methodKey, methodParams } = this.getMKMP(attr);
            node.addEventListener("click", () => {
                this.$methods[methodKey].call(this, ...methodParams);
            });
        }
    }
    bindForLoop(node) {
        if (node.hasAttribute("v-for")) {
            let forloopStr = node.getAttribute("v-for");
            node.removeAttribute("v-for");
            let matchResult = forloopStr.match(/\(.+,.+\)/g);
            let KandV = matchResult[0].slice(1, matchResult[0].length - 1);
            // let loopKey = KandV.split(",")[0].trim();
            let loopVal = KandV.split(",")[0].trim();
            let rootVal = forloopStr
                .split(" ")
                [forloopStr.split(" ").length - 1].trim();
            Object.keys(this.$data[rootVal]).forEach((onekey) => {
                let newNode = node.cloneNode(true);
                this.prefixNodeAttr(newNode, rootVal, onekey);
                node.parentNode.append(newNode);
                this.compile(newNode);
            });
            node.remove();
        }
    }
    prefixNodeAttr(node, prefix, keyfix) {
        if (node.childNodes.length > 0) {
            node.childNodes.forEach((cn) => {
                if (cn.nodeType === 1) {
                    let nodetxt = cn.textContent;
                    if (nodetxt.match(/\{\{(.*?)\}\}/g)) {
                        cn.setAttribute(
                            "v-text",
                            nodetxt.slice(2, nodetxt.length - 2).trim()
                        );
                        cn.textContent = "";
                    }
                    this.prefixNodeAttr(cn, prefix, keyfix);
                }
            });
        }

        let attrs = node.attributes;
        for (let i = 0; i < attrs.length; i++) {
            let orgAttrName = attrs[i].name;
            let orgAttrVal = attrs[i].value.split(".");
            orgAttrVal.splice(0, 1);
            let newAttrValArray = [prefix, keyfix].concat(orgAttrVal);
            let newAttrVal = newAttrValArray.join(".");
            node.setAttribute(orgAttrName, newAttrVal);
            this.watchTask[newAttrVal] = this.watchTask[newAttrVal] || [];
        }
    }
    // get method key and method params
    getMKMP(attr) {
        if (attr.match(/\(.+\)/g)) {
            let mk = attr.split("(")[0];
            let pstr = attr.match(/\(.+\)/g)[0];
            pstr = pstr.slice(1, pstr.length - 1);
            let params = [];
            if (pstr.includes(",")) {
                pstr.split(",").forEach((one) => {
                    one = one.trim();
                    if (!isNaN(one)) {
                        params.push(parseInt(one));
                    } else {
                        params.push(one);
                    }
                });
            } else {
                if (!isNaN(pstr)) {
                    params.push(parseInt(pstr));
                } else {
                    params.push(pstr);
                }
            }
            return { methodKey: mk, methodParams: params };
        } else {
            return { methodKey: attr, methodParams: [] };
        }
    }
    showAllData() {
        let count = 1;
        Object.keys(this).forEach((k) => {
            console.log(`key${count}:${k} => ${this[k]}`);
            count++;
        });
    }
}

class Watch {
    constructor(node, type, ifAttr = false, vm = null) {
        this.vm = vm;
        this.node = node;
        this.type = type;
        this.ifAttr = ifAttr;
    }
    update(newVal) {
        if (this.ifAttr) {
            this.node.setAttribute(this.type, newVal);
        } else {
            this.node[this.type] = newVal;
        }
    }
}
