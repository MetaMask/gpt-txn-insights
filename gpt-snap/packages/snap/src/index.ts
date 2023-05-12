import { Json, OnTransactionHandler } from '@metamask/snaps-types';
import { divider, heading, panel, text } from '@metamask/snaps-ui';

const txnInsightObject: { data: Json; contractAddress: Json; response: any; }[] = []

const getContractInfo = (url: string, data: string) => {  
  return new Promise((resolve) => {
    fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
      body: data,
    })
      .then((response) => response.json())
      .then((data) => {
        resolve(data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
};

export const onTransaction: OnTransactionHandler = async ({ transaction: {contractAddress, data} }) => {  
  const url = `https://enigmatic-castle-61728.herokuapp.com/contract-info`;
  let response = await getContractInfo(url, JSON.stringify({ data, contract_address: contractAddress }))
  txnInsightObject.push({data, contractAddress, response})

  return {
    content: panel([
      heading('ChatGPT Snap'),
      text('_hackathon/chatgpt-tx-insight_'),
      divider(),
      text('Here\'s insight from chatGPT on the contract you are interacting with: '),
      ...txnInsightObject.map((item) => {
        return panel([
          text(`${item?.response?.result?.contract_info ?? ''}`),
          text(`${item?.response?.result?.transaction_info ?? ''}`)
        ])
      }),
    ]),
  };
};