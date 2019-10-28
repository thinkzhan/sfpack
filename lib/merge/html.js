import global from '../global';
import Event from '../help/event';

export default graph => {
    function createHtml(id) {
        // ast todo
        return graph[id] ? graph[id].html.replace(
            /\<component\s*src\=('|")([^\'\"]+)\1[^\>]*\/\>/g,
            ($, $1, $2) => {
                return createHtml(graph[id].mapping[$2]);
            }
        ) : '[Error]: invalid component ';
    }
    global.compilation.html = createHtml(0);
    //event: AFTER_MERGE
    Event.emit('AFTER_MERGE_HTML', global);
    // lazy
    return global.compilation.html
};

