import Event from '../help/event';
import { isArray, isFunction } from '../help/is';

export default plugins => {
    for (let p in plugins) {
        let v = plugins[p];

        if (isFunction(v)) {
            Event.on(p, v);
        } else if (isArray(v)) {
            v.forEach(vv => {
                if (isFunction(vv)) {
                    Event.on(p, vv);
                } else {
                    throw new TypeError('[PLUGIN ERR]: need a Function');
                }
            });
        } else {
            throw new TypeError(
                '[PLUGIN ERR]: need a Function or a Array of Function'
            );
        }
    }
};
