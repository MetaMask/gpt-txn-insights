# ChatGPT Powered Transaction Insights Snap

The project has been developer for Cypherpunk Hackathon 2023.

<img src="https://github.com/MetaMask/gpt-txn-insights/blob/main/demo/demo1.png?raw=true" width="200px" />

### Description
As part of the project we developed a ChatGPT powered transaction insight snap. It displays details of transaction's contract source code in Human Readable form to users.

We pass to this snap transaction details like contract address and transaction data. The snap queries a service to get GPT powered insights about the transaction and display to the user.

This service that the snap queries has also been developed by us. What we do in this service is using the contract address we obtain source code of the contract using etherscan api. We pass this source code and also transaction data with appropriate prompt to GPT api to get details about the contract and transaction data.

### Thus the technologies used are:
1. Snap in Flask
2. NodeJS backend deployed on Heroku
3. Etherscan api to get contract details
4. Microsoft Azure OpenAI api

### Local deployment
1. Run a local build of flask using Metamask Extension branch [gpt_insight_snap](https://github.com/MetaMask/metamask-extension/tree/gpt_insight_snap). (This branch is required as it passes contract address parameters to transaction insight snap.)
2. Locally run the snap <<link_to_be_added>> and add it to flask.
3. Trigger any transaction to see the insights.
