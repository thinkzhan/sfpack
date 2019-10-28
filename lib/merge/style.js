import global from '../global';
import Event from '../help/event';

export default graph => {
    let css = [];
    function createCss(ids) {
        ids.forEach(id => {
            if (graph[id]) {
                css.push(graph[id].style);
                css.concat(createCss(graph[id].ids));
            }
        });
        return css;
    }

    global.compilation.style = createCss([0]).join('');

    Event.emit('AFTER_MERGE_STYLE', global);
    return global.compilation.style
};
