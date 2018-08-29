<template>
    <div id="app">
        <router-view></router-view>
    </div>
</template>

<script>
export default {
    name: 'app',
    dara () {
        return {

        }
    },
    methods:{
        
    }
}

</script>

<style>
html {
    font-size: 20px;
}

body,
ul,
li {
    padding: 0;
    margin: 0;
}

a {
    text-decoration: none;
    color: #000;
}

li {
    list-style: none;
}

#app {
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    align-items: center;
    color: #000;
    font-size: 0.8rem;
}
.icon {
    width: 1em; height: 1em;
    vertical-align: -0.15em;
    fill: currentColor;
    overflow: hidden;
}
</style>
