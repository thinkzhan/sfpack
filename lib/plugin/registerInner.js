import register from './register';
import hasPlugin from './hashPlugin';
import compressPlugin from './compressPlugin';
import htmlResPlugin from './htmlResPlugin';

register(compressPlugin)
register(hasPlugin)
register(htmlResPlugin)