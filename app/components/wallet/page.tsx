'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import styles from './page.module.scss';
import { FaRegCopy,FaEthereum } from 'react-icons/fa6';
import { AiFillCheckCircle } from 'react-icons/ai';
import { Web3 } from 'web3';
import { getBalance,sendTransaction } from '../../service';
import axios from 'axios';
import BigNumber from 'bignumber.js';




declare global {
  interface Window {
    ethereum?: any;
  }
}

const WalletPage = () => {

  const [activeNetwork, setActiveNetwork] = useState('Mainnet');
  const [address, setAddress] = useState<string>('');
  const [activeCoin, setActiveCoin] = useState<string>('BNB');
  const [amount, setAmount] = useState<string>('');
  const [recipientAddress, setRecipientAddress] = useState<string>('0x567c5fa2Eb5ecCBCfA1d028ED5a2CBf47cdBd85c')
  const [accountBalance, setAccountBalance] = useState<string | null>(null);
  const [hoveredSvg, setHoveredSvg] = useState<boolean>(false);
  const [addressCopied, setAddressCopied] = useState<boolean>(false);
  const [coinsData, setCoinsData] = useState<{
    [key: string]: { symbol: string; address: string; provider: string };
  }>({
    BNB: {
      symbol: 'BNB',
      address: address,
      provider: `https://bsc-dataseed1.binance.org`
    },
    ETH: {
      symbol: 'ETH',
      address: address,
      provider: 'https://mainnet.infura.io/v3/9086527a5b44445aba865fdc391406a8'
    },
  });

  const copyHandler = () => {
    navigator.clipboard.writeText(address);
    setAddressCopied(true);
    setTimeout(() => {
      setAddressCopied(false);
      setHoveredSvg(false);
    }, 3000);
  };


  useEffect(() => {
    const loadWeb3 = async () => {
      if (typeof window.ethereum !== 'undefined') {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const web3Instance = new Web3(window.ethereum);
          const accounts = await web3Instance.eth.getAccounts();
          setAddress(accounts[0]);
          console.log('MetaMask is connected!', address);
        } catch (error) {
          console.error('Failed to connect to MetaMask:', error);
        }
      } else {
        console.error('MetaMask is not installed!');
      }
    };
    loadWeb3();
  }, []);

  const connectMetaMask = async () => {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const web3Instance = new Web3(window.ethereum);
      const accounts = await web3Instance.eth.getAccounts();
      setAddress(accounts[0]);
      console.log('MetaMask is connected!', accounts[0]);
    } catch (error) {
      console.error('Failed to connect to MetaMask:', error);
    }
  };

  const handleConnectClick = () => {
    if (typeof window.ethereum !== 'undefined') {
      connectMetaMask();
    } else {
      console.error('MetaMask is not installed!');
    }
  };

  useEffect(() => {
    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        // Пользователь вышел из аккаунта MetaMask
        setAddress('');
      }
    };

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.off('accountsChanged', handleAccountsChanged);
      }
    };
  }, [address]);
  useEffect(() => {
    setCoinsData(prevCoinsData => ({
      ...prevCoinsData,
      BNB: {
        ...prevCoinsData.BNB,
        address: address,

      },
      ETH: {
        ...prevCoinsData.ETH,
        address: address,

      },
    }));
  }, [address]);


  const fetchBalance = async () => {
    const coinData = coinsData[activeCoin];
    console.log('coinData', coinData.provider);
    const balance = await getBalance(coinData.provider,'0x4A2a082B1bAA257c0ce3116D02e23074F713A086');
    console.log('balance', balance);
    return balance

  }

  // useEffect(() => {
  //   const fetchBalance = async () => {
  //     try {
  //       if (!address || !activeCoin) return;
  //
  //
  //       const coinData = coinsData[activeCoin];
  //       console.log('coinData',coinData);
  //       console.log('coinData', coinData.provider)
  //       const balance = await getBalance(coinData.provider,coinData.address)
  //
  //       // setAccountBalance(balance);
  //     } catch (error) {
  //       console.error('Error fetching balance:', error);
  //     }
  //   };
  //
  //   fetchBalance();
  // }, [address, activeCoin, coinsData]);








  const log = async () => {
    console.log('address', address)
    console.log('receip', recipientAddress)
    console.log('amount', amount);
    console.log('coinData.provider', coinsData[activeCoin]['provider']);
    await sendTransaction(coinsData[activeCoin]['provider'], recipientAddress, amount)
  }

  return (
    <div className={styles.wallet_page}>
      {address.length <= 0 ? (
        <div className={styles.metamask_button_block}>
          <button className={styles.connect} onClick={handleConnectClick}>Connect</button>
          <FaEthereum size={25}/>
        </div>

      ) : (
        <>
          <h1 onClick={fetchBalance}>Account 1</h1>
          <div className={styles.networks}>
          <span
            className={`${styles.network} ${activeNetwork === 'Mainnet' ? styles.active : ''}`}
            onClick={() => setActiveNetwork('Mainnet')}
          >
            Mainnet
          </span>
            <span
              className={`${styles.network} ${activeNetwork === 'Testnet' ? styles.active : ''}`}
              onClick={() => setActiveNetwork('Testnet')}
            >
            Testnet
          </span>
          </div>

          <div className={styles.address_block}>
            <span>{address}</span>
            {addressCopied ? (
              <AiFillCheckCircle color='green' />
            ) : (
              <FaRegCopy
                className={styles.copy}
                onMouseEnter={() => setHoveredSvg(!hoveredSvg)}
                onMouseLeave={() => setHoveredSvg(!hoveredSvg)}
                onClick={copyHandler}
              />
            )}
          </div>
          {hoveredSvg && (
            <div className={styles.clipboard_block}>
              {addressCopied ? 'Address copied' : 'Copy to clipboard'}
            </div>
          )}
          <div className={styles.wallets}>
            <div
              className={`${styles.wallet_block} ${activeCoin === 'BNB' ? styles.active : ''}`}
              onClick={() => setActiveCoin('BNB')}
            >
              <span>BNB</span>
              <Image
                src='/bnb.png'
                alt='bnb'
                className={styles.vercelLogo}
                width={20}
                height={20}
                priority
              />
            </div>

            <div
              className={`${styles.wallet_block} ${activeCoin === 'ETH' ? styles.active : ''}`}
              onClick={() => setActiveCoin('ETH')}
            >
              <span>ETH</span>
              <Image
                src='/eth.png'
                alt='eth'
                className={styles.vercelLogo}
                width={15}
                height={18}
                priority
              />
            </div>
          </div>
          <div className={styles.balance}>
            {accountBalance && <span>$ {accountBalance} {activeCoin === 'BNB' ? 'BNB' : 'ETH'}</span>}
          </div>
          <div className={styles.send_block}>
            <div className={styles.send_block}>
              <input
                className={styles.address}
                type='text'
                id='recipientAddress'
                value={recipientAddress}
                name='recipientAddress'
                placeholder='Enter public address(0x) or ENS name:'
                onChange={(e) => setRecipientAddress(e.target.value)}
              />
              <div className={styles.transaction_block}>
                <input
                  type='text'
                  id='amount'
                  name='amount'
                  className={styles.amount}
                  placeholder='Enter amount'
                  value={amount}
                  onChange={(e) => {
                    const value = e.target.value;
                    const onlyNumbersAndDot = value.replace(/[^0-9.]/g, '');
                    setAmount(onlyNumbersAndDot);
                  }}
                />
                <button onClick={log}>SEND</button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
  export default WalletPage;









// 0x4A2a082B1bAA257c0ce3116D02e23074F713A086



//testnet https://api-testnet.bscscan.com/api?module=account&action=balance&address=0x4A2a082B1bAA257c0ce3116D02e23074F713A086&apikey=YourApiKeyTokenFI5M3NG1TWWKNHWSBBPFDTQTJZCG95I7YM

// const getCoinData = async () => {
//   try {
//     const response = await axios.get('https://api-testnet.bscscan.com/api?module=account&action=balance&address=0x4A2a082B1bAA257c0ce3116D02e23074F713A086&apikey=YourApiKeyTokenFI5M3NG1TWWKNHWSBBPFDTQTJZCG95I7YM');
//     const balanceWei = response.data.result;
//     const balance = new BigNumber(balanceWei).dividedBy(new BigNumber(10).pow(18)).toFixed(2).toString();
//     console.log('balance', balance);
//     return balance;
//   } catch (error) {
//     console.error('Error fetching balance:', error);
//     throw error;
//   }
// };
//
// getCoinData();





//HFSAS518SE7AGBAYXQ85UQ7I241DISNXCW

//https://api.bscscan.com/api?module=account&action=balance&address=0x70F657164e5b75689b64B7fd1fA275F334f28e18&apikey=HFSAS518SE7AGBAYXQ85UQ7I241DISNXCW
// https://api-testnet.bscscan.com/api?module=account&action=balance&address=0x4A2a082B1bAA257c0ce3116D02e23074F713A086&apikey=YourApiKeyTokenFI5M3NG1TWWKNHWSBBPFDTQTJZCG95I7YM