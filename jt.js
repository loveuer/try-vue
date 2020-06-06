// class Vue {
//     constructor(options = {}) {
//         this.$data = options.data;
//         this.watchTask = {};
//         this.proxyData(this.$data);
//         this.obData(this.$data);
//     }
//     proxyData(data) {
//         Object.keys(data).forEach((onekey) => {
//             Object.defineProperty(this, onekey, {
//                 configurable: false,
//                 enumerable: true,
//                 get() {
//                     return data[onekey];
//                 },
//                 set(newVal) {
//                     data[onekey] = newVal;
//                 },
//             });
//         });
//     }
//     obData(data, prefix = []) {
//         let namelist;
//         Object.keys(data).forEach((onekey) => {
//             let val = data[onekey];
//             if (typeof val === "object") {
//                 this.obData(val, prefix.concat([onekey]));
//             }
//             namelist = prefix.concat([onekey]);
//             this.watchTask[namelist] = [];
//             Object.defineProperty(data, onekey, {
//                 configurable: false,
//                 enumerable: true,
//                 get() {
//                     return val;
//                 },
//                 set(newVal) {
//                     if (newVal !== val) {
//                         console.log(
//                             `find data chg: [${namelist.join(
//                                 "."
//                             )}]: ${val} => ${newVal}`
//                         );
//                         val = newVal;
//                     }
//                 },
//             });
//         });
//     }
// }

// let mv = new Vue({
//     data: {
//         zyp: { name: "loveuer", age: 29 },
//         sjp: { name: "ddd", age: 30 },
//         address: "chengdu",
//         students: {
//             grade1: { count: 34, ava: 90 },
//             grade2: { count: 32, ava: 87 },
//             grade3: { count: 36, ava: 78 },
//         },
//         works: [12, 13, 17, 19],
//     },
// });

// mv.$data.address = "china";
// mv.$data.zyp.name = "nice";
// mv.sjp.age = 29;
// mv.students.grade2.ava = 88;
// mv.works[0] = 21;

let data = ["name", "age", "work"];
let nums = [];
Object.keys(data).forEach((onekey) => {
    let val = data[onekey];
    Object.defineProperty(data, onekey, {
        configurable: false,
        enumerable: true,
        get() {
            return data[onekey];
        },
        set(newVal) {
            console.log(`find chg: ${val} => ${newVal}`);
            val = newVal;
        },
    });
});

data[2] = "haha";

console.log(Array.isArray(data));

