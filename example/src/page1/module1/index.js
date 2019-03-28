console.log("module1自动引入");

let f = () => {
    const a = 1;
};

require("./other.js");

// import "./other.js";
