// const request = require("request");
const axios = require("axios");
const randomUseragent = require("random-useragent");
const ua = randomUseragent.getRandom();

axios.defaults.headers.common = {
    "apikey": "iniapikeyunlimitedarihiddenapixyz",
  };
axios({
  method: "post",
  url: encodeURI("https://api.hiddenapi.xyz/imgtopdf?apikey=iniapikeyunlimitedarihiddenapixyz"),
  headers: { "user-agent": ua, key: `iniapikeyunlimitedarihiddenapixyz`, "Content-Type": "application/json",},
  data: {
    key: `iniapikeyunlimitedarihiddenapixyz`,
  },
}).then(function (resp) {
  console.log(resp);
});
