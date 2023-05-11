const { Configuration, OpenAIApi } = require("openai");
const https = require("https");
const express = require("express");
const cors = require("cors");

require("dotenv").config();

var app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const KEY = process.env.CHAT_GPT_KEY;
const configuration = new Configuration({
  apiKey: KEY,
});
const openai = new OpenAIApi(configuration);

// todo: error handling
const getContractSourceCode = (contract_id) => {
  return new Promise((resolve) => {
    https
      .get(
        `https://api-goerli.etherscan.io/api?module=contract&action=getsourcecode&address=${contract_id}&apikey=${process.env.ETHERSCAN_KEY}`,
        (resp) => {
          let data = "";
          resp.on("data", (chunk) => {
            data += chunk;
          });
          resp.on("end", () => {
            const res = JSON.parse(data);
            if (!res.result?.length || !res.result[0].SourceCode)
              resolve("Contract source code not verified");
            const source_code = res.result[0].SourceCode.replaceAll("  ", " ")
              .replaceAll("///", "//")
              .replace(/(\/\*[\s\S]*?\*\/|\/\/.*)/g, "")
              .replaceAll("\r", "")
              .replaceAll("\n", "");
            resolve(source_code);
          });
        }
      )
      .on("error", (err) => {
        console.log("Error: ", err);
        resolve("");
      })
      .end();
  });
};

const getChatGPTCompletion = (prefix, data) => {
  return new Promise((resolve) => {
    const prompt = `${prefix} ${data}`;

    openai
      .createCompletion({
        model: "text-davinci-003",
        prompt: prompt,
        max_tokens: 500,
        temperature: 0.7,
        n: 1,
        echo: false,
      })
      .then((response) => {
        resolve(response.data.choices[0].text);
      });
  });
};

const handleRequest = async (contract_id, data, res) => {
  try {
    const result = {};
    if (contract_id) {
      const source_code = await getContractSourceCode(contract_id);
      if (source_code) {
        let contract_info = await getChatGPTCompletion(
          "just describe this smart contract code and its functions \r\n",
          source_code.substr(0, 8000)
        );
        result.contract_info = contract_info
          .replaceAll("\r", "")
          .replaceAll("\n", "");
      }
    }
    if (data) {
      let transaction_info = await getChatGPTCompletion(
        "just describe transaction hex data ",
        data.substr(0, 8000)
      );
      result.transaction_info = transaction_info
        .replaceAll("\r", "")
        .replaceAll("\n", "");
    }
    res.json({
      result,
    });
  } catch (exp) {
    console.log(exp);
    res.json({
      info: "Unable to get transaction insights",
    });
  }
};

app.get("/contract-info", async (req, res) => {
  const contract_id = req.query.contract_address;
  const data = req.query.data;
  await handleRequest(contract_id, data, res);
});

app.post("/contract-info", async (req, res) => {
  const contract_id = req.body.contract_address;
  const data = req.body.data;
  await handleRequest(contract_id, data, res);
});

app.listen(process.env.PORT || 5001, () => {
  console.log("Server running on port 5001");
});
