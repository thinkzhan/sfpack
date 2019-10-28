import other from './other'; // import会提升到顶部
// const other = require('./other').default;

const f = () => {
    console.log('component自动引入');
};

f()

other.init()
