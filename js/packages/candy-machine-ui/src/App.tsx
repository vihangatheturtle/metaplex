import './App.css';
import { useMemo } from 'react';
import * as anchor from '@project-serum/anchor';
import Home from './Home';

import { clusterApiUrl } from '@solana/web3.js';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from '@solana/wallet-adapter-wallets';

import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletDialogProvider } from '@solana/wallet-adapter-material-ui';

import { ThemeProvider, createTheme } from '@material-ui/core';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'
import { Center } from '@chakra-ui/react'

const URLSearchParams = window.URLSearchParams;

const chakraTheme = extendTheme({
  colors: {
  all: {
    500:"#d554f6"
  }
}
})

const theme = createTheme({
  palette: {
    type: 'dark',
  },
});

function getQuery(key: string) {
  var query = new URLSearchParams(window.location.search);
  var res = query.get(key)
  if (res === null) {
    res = ''
  }
  return res;
}

if (getQuery('cmid') === null || getQuery('cmid') === '') {
  window.location.href = 'https://hovermint.com'
}

console.log("Detected CMID in query: " + getQuery('cmid'))

var rawCandyMachineID = getQuery('cmid');

const getCandyMachineId = (): anchor.web3.PublicKey | undefined => {
  try {
    const candyMachineId = new anchor.web3.PublicKey(
      getQuery('cmid')!,
    );

    return candyMachineId;
  } catch (e) {
    console.log('Failed to construct CandyMachineId', e);
    return undefined;
  }
};

const candyMachineId = getCandyMachineId();
const network = 'mainnet-beta' as WalletAdapterNetwork;
const rpcHost = 'https://solana-api.projectserum.com'!;
const connection = new anchor.web3.Connection(rpcHost
  ? rpcHost
  : anchor.web3.clusterApiUrl('devnet'));

const startDateSeed = parseInt(process.env.REACT_APP_CANDY_START_DATE!, 10);
const txTimeoutInMilliseconds = 30000;

const App = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSolflareWallet(),
      getSlopeWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    [],
  );

  return (
    <ChakraProvider theme={chakraTheme}>
      <ThemeProvider theme={theme}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <WalletDialogProvider>
              <Center>
              <Home
                candyMachineId={candyMachineId}
                rawCandyMachineID={rawCandyMachineID}
                connection={connection}
                startDate={startDateSeed}
                txTimeout={txTimeoutInMilliseconds}
                rpcHost={rpcHost}
              />
              </Center>
            </WalletDialogProvider>
          </WalletProvider>
        </ConnectionProvider>
      </ThemeProvider>
    </ChakraProvider>
  );
};

export default App;
