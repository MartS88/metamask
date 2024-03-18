import Web3 from 'web3';

export const getBalance = async (provider: string, address: string) => {
    try {
      const web3 = new Web3(new Web3.providers.HttpProvider(provider));
      const balanceWei = await web3.eth.getBalance(address);
      const balanceEth = web3.utils.fromWei(balanceWei, 'ether');
      console.log('balanceEth', balanceEth);
      return balanceEth;
    } catch (error) {
      console.error('Error while checking account balance:', error);
      throw error;
    }

};


export const sendTransaction = async (provider: string, recipientAddress: string, amount: string) => {
  try {
    const web3 = new Web3(provider);
    const accounts = await web3.eth.requestAccounts();
    const senderAddress = accounts[0];


    const balance = await web3.eth.getBalance(senderAddress);
    const ethBalance = web3.utils.fromWei(balance, 'ether');
    if (Number(ethBalance) < Number(amount)) {
      throw new Error('Insufficient funds');
    }

    const tx = {
      from: senderAddress,
      to: recipientAddress,
      value: web3.utils.toWei(amount, 'ether'),
    };
    const receipt = await web3.eth.sendTransaction(tx);
    console.log('Transaction receipt:', receipt);
    return receipt;
  } catch (error) {
    console.error('Transaction failed:', error);
    throw error;
  }
};
