var express = require("express");
var randomstring = require("randomstring");
var authToken = require("./key_file");
var request = require("request");

const handleSubmit = async (input, key) => {
  var headers = {
    Authorization: `Bearer ${authToken}`,
    "Content-Type": "application/json"
  };

  var dataString = JSON.stringify({
    payload: {
      textSnippet: {
        content: input,
        mime_type: "text/plain"
      }
    }
  });

  var options = {
    url:
      "https://automl.googleapis.com/v1beta1/projects/795970644708/locations/us-central1/models/TCN1424285372388474880:predict",
    method: "POST",
    headers: headers,
    body: dataString
  };

  function callback(error, response, body) {
    if (!error && response.statusCode == 200) {
      store[key].response = JSON.parse(body);
      store[key].status = true;
    }
  }

  request(options, callback);
};

// Set up express stuff....
const app = express();
const port = 3000;

var store = {};

app.get("/submit", (req, res) => {
  const input = req.query.data;

  let string = randomstring.generate(40);
  while (string in store) string = randomstring.generate(40);
  store[string] = {
    status: false,
    input
  };
  res.end(string);
  handleSubmit(input, string);
});

app.get("/check/:id", (req, res) => {
  const id = req.params.id;
  if (id in store && store[id].status)
    res.send(JSON.stringify(store[id].response));
  else res.send("wait");
});

app.get("/input/:id", (req, res) => {
  const id = req.params.id;
  res.send(store[id].input);
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
