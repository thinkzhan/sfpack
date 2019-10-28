export function isArray(obj) {
    return Object.prototype.toString.call(obj) == "[object Array]"
}

export function isFunction(obj) {
    return Object.prototype.toString.call(obj) == "[object Function]"
}

export function isRelative(path) {
    return /^(\.|\.\.\/|\/)/.test(path);
}

export function isComponent(tagName, tagAttr) {
    return tagName === 'component' && tagAttr.hasOwnProperty('src');
}
export function isHtmlImg(tagName, tagAttr) {
    return tagName === 'img' && isRelative(tagAttr.src);
}

export function isInlineRes(tagName, tagAttr) {
    return ['template', 'script', 'style'].includes(tagName) && !(tagAttr && tagAttr.hasOwnProperty('src'));
}


