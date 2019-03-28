<template>
    <div>
        <div id="header">
            this is  <span>{{msg}}</span>
        </div>

    </div>
</template>
<style>
#header {
    background: url("./img/icon3.png") no-repeat;

    span {
        color: red;
    }
}
</style>
<script>
import test from "./test.js";
console.log(test);

export default {
    data() {
        return {
            msg: "hello world"
        };
    },
    components: {},
    mounted() {
        const msg = "world";
        console.log("hello!!", msg);
    }
};
</script>
