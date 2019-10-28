export default function extend(target, cloneObj) {
    function type(obj) {
        return Object.prototype.toString.call(obj).slice(8, -1);
    }
    var copy;
    for (var i in cloneObj) {
        copy = cloneObj[i];
        if (!copy || target === copy) {
            continue;
        }
        if (type(copy) === "Array") {
            target[i] = extend(target[i] || [], copy);
        } else if (type(copy) === "Object") {
            target[i] = extend(target[i] || {}, copy);
        } else {
            target[i] = copy;
        }
    }
    return target;
}