import React, { useEffect, useMemo, useState, useCallback } from 'react';
import * as anchor from '@project-serum/anchor';

import './Home.css';
import styled from 'styled-components';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletDialogButton } from '@solana/wallet-adapter-material-ui';
import {
  awaitTransactionSignatureConfirmation,
  CandyMachineAccount,
  CANDY_MACHINE_PROGRAM,
  getCandyMachineState,
  mintOneToken,
} from './candy-machine';
import { AlertState } from './utils';
import { Header } from './Header';
import { MintButton } from './MintButton';
import { GatewayProvider } from '@civic/solana-gateway-react';
import { createBrowserHistory } from 'history';
import { verifyKey } from './HyperAuth';
/*
import { AutoMintCheckbox } from './AutoMint'
import { MintAmount } from './CandyMintAmount';
import { AppNote } from './AppNote';
import { CMInput } from './cmInput';
*/ // ADD LATER
import { NavBar } from './NavBar';
import { mintMultipleTokens } from './candy-machine';
import { Box, Center, Flex, HStack, Spacer, Text, Stack, Switch, Tooltip,  NumberInput, NumberInputField, NumberInputStepper, NumberIncrementStepper, NumberDecrementStepper } from '@chakra-ui/react'

async function auth() {
  async function startAuth(key: string) {
    var res = await verifyKey(key)

    if (res !== true) {
      console.log("Invalid license key");
      localStorage.removeItem('license');
      document.body.remove();
      alert("Please refresh the page and use a valid license key");
    } else {
      console.log("Valid license key");
      document.body.style.display = 'block';
      document.body.style.opacity = "1";
    }
  }

  async function main() {
    var savedKey = localStorage.getItem('license');

    if (savedKey !== null && savedKey !== '' && savedKey !== undefined) {
      console.log("Found saved license");
      startAuth(savedKey);
    } else {
      console.log("No license found");
      var key = window.prompt('Enter your license key');
      if (key !== null && key !== '') {
        localStorage.setItem('license', key);
        startAuth(key);
      } else {
        console.log("Invalid license key");
        localStorage.removeItem('license');
        document.body.remove();
        alert("Please refresh the page and use a valid license key");
      }
    }
  }

  main();
}

auth();

const ConnectButton = styled(WalletDialogButton)`
  width: 360px;
  height: 40px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #141414 0%, #141414 100%);
  color: white;
  font-size: 16px;
  font-family: 'Roboto', sans-serif !important;
  border: 1px solid black;
`;

//const MintContainer = styled.div``; // add your owns styles here

export interface HomeProps {
  candyMachineId?: anchor.web3.PublicKey;
  connection: anchor.web3.Connection;
  rawCandyMachineID: string;
  startDate: number;
  txTimeout: number;
  rpcHost: string;
}

const Home = (props: HomeProps) => {
  const [isUserMinting, setIsUserMinting] = useState(false);
  const [candyMachine, setCandyMachine] = useState<CandyMachineAccount>();
  const [alertState, setAlertState] = useState<AlertState>({
    open: false,
    message: '',
    severity: undefined,
  });
  const [currentCmid, setCmid] = useState("")
  const [isAutoMinting] = useState(false)
  const [mintAmount, setMintAmount] = useState(1)
  const [mintCheckNumber, setMintCheckNumber] = useState(0)

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  useEffect(() => {
    if (props.rawCandyMachineID) {
      setCmid(props.rawCandyMachineID)
    }
  }, [props.rawCandyMachineID]);

  const isAutoMint = (event: React.ChangeEvent<HTMLInputElement>) => {
      alert("Automint is not fully implemented, it will be available soon!")
      //setIsAutoMinting(event.target.checked)
      event.target.checked = false;
  }

  const anchorWallet = useMemo(() => {
    if (
      !wallet ||
      !wallet.publicKey ||
      !wallet.signAllTransactions ||
      !wallet.signTransaction
    ) {
      return;
    }

    return {
      publicKey: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      signTransaction: wallet.signTransaction,
    } as anchor.Wallet;
  }, [wallet]);

  const refreshCandyMachineState = useCallback(async () => {
    if (!anchorWallet) {
      return;
    }

    if (props.candyMachineId) {
      try {
        const cndy = await getCandyMachineState(
          anchorWallet,
          props.candyMachineId,
          props.connection,
        );
        setCandyMachine(cndy);
      } catch (e) {
        console.log('There was a problem fetching Candy Machine state');
        console.log(e);
      }
    }
  }, [anchorWallet, props.candyMachineId, props.connection]);

  function mintSuccess() {
    setAlertState({
      open: true,
      message: 'Congratulations! Mint succeeded!',
      severity: 'success',
    });
  }

  function mintFailure() {
    setAlertState({
      open: true,
      message: 'Mint failed! Please try again!',
      severity: 'error',
    });
  }

  const handleCmidInutKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      if (currentCmid.length === 44) {
        const history = createBrowserHistory();
        history.push(`/?cmid=${currentCmid}`);
        window.location.reload();
      } else {
        setAlertState({
          open: true,
          message: 'Please enter a valid CMID',
          severity: 'error',
        });
      }
    }
  }

  const onMint = async () => {
    if (mintAmount === mintCheckNumber)
      return false;
    async function mintTokenEZ(amount: number) {
      if (amount === 1) {
        if (mintAmount !== mintCheckNumber) {
        try {
          if (mintAmount === mintCheckNumber)
            return false;
          setIsUserMinting(true);
          document.getElementById('#identity')?.click();
          if (wallet.connected && candyMachine?.program && wallet.publicKey) {
            const mintTxId = (
              await mintOneToken(candyMachine, wallet.publicKey)
            )[0];

            let status: any = { err: true };
            if (mintTxId) {
              status = await awaitTransactionSignatureConfirmation(
                mintTxId,
                props.txTimeout,
                props.connection,
                true,
              );
            }

            if (status && !status.err) {
              setAlertState({
                open: true,
                message: 'Congratulations! Mint succeeded!',
                severity: 'success',
              });
            } else {
              setAlertState({
                open: true,
                message: 'Mint failed! Please try again!',
                severity: 'error',
              });
            }
          }
        } catch (error: any) {
          let message = error.msg || 'Minting failed! Please try again!';
          if (!error.msg) {
            if (!error.message) {
              message = 'Transaction Timeout! Please try again.';
            } else if (error.message.indexOf('0x137')) {
              message = `SOLD OUT!`;
            } else if (error.message.indexOf('0x135')) {
              message = `Insufficient funds to mint. Please fund your wallet.`;
            }
          } else {
            if (error.code === 311) {
              message = `SOLD OUT!`;
              window.location.reload();
            } else if (error.code === 312) {
              message = `Minting period hasn't started yet.`;
            }
          }

          setAlertState({
            open: true,
            message,
            severity: 'error',
          });
        } finally {
          setIsUserMinting(false);
          window.localStorage.isMintingFinished = true;
        }
      }
      } else if (amount > 1) {
        if (wallet.connected && candyMachine?.program && wallet.publicKey) {
          if (mintAmount !== mintCheckNumber)
            await mintMultipleTokens(candyMachine, wallet.publicKey, amount, props.txTimeout, props.connection, mintSuccess, mintFailure);
          else
            window.localStorage.isMintingFinished = true;
        }
      }
      setMintCheckNumber(mintCheckNumber + 1)
    }
    //var cmAmount = 1;
    //if (!isNaN(parseInt((document.getElementById('candyMintAmount') as HTMLInputElement).value))) {
    //  cmAmount = parseInt((document.getElementById('candyMintAmount') as HTMLInputElement).value);
    //}
    await mintTokenEZ(mintAmount)
    return true;
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);


  var staticWalletAddress = '';

  if (wallet.publicKey !== undefined) {
    try {
      staticWalletAddress = wallet.publicKey!.toString();
    } catch { }
  }

  return (
    <div>
      <NavBar
        walletAddress={staticWalletAddress}
      />
      <Box style={{ marginTop: 180 }}>
          <Box w="400px">
            <Stack spacing="3px">
              <Box h="100px" w="400px" bg="#1E1E1E" borderTopRadius="6px" border="1px" borderColor={"#313131"} paddingTop="12px">
                <Center>
                  <Stack spacing="12px">
                    <Flex>
                      <HStack>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M1.71436 3.28572C1.71436 2.86895 1.87992 2.46926 2.17462 2.17456C2.46932 1.87986 2.86902 1.71429 3.28578 1.71429H11.0001C11.4168 1.71429 11.8165 1.87986 12.1112 2.17456C12.4059 2.46926 12.5715 2.86895 12.5715 3.28572V4.00458C13.1139 4.04082 13.6223 4.28187 13.9936 4.67889C14.365 5.07592 14.5715 5.59924 14.5715 6.14287V12.1429C14.5715 12.7112 14.3457 13.2562 13.9439 13.6581C13.542 14.06 12.997 14.2857 12.4286 14.2857H3.8595C3.29118 14.2857 2.74613 14.06 2.34427 13.6581C1.94241 13.2562 1.71664 12.7112 1.71664 12.1429V6.14287H1.71436V3.42858H1.72064C1.71641 3.38108 1.71431 3.33341 1.71436 3.28572V3.28572ZM11.7144 3.28572C11.7144 2.89144 11.3944 2.57144 11.0001 2.57144H3.28578C3.09634 2.57144 2.91466 2.64669 2.78071 2.78065C2.64675 2.9146 2.5715 3.09628 2.5715 3.28572C2.5715 3.47516 2.64675 3.65684 2.78071 3.7908C2.91466 3.92475 3.09634 4.00001 3.28578 4.00001H11.7144V3.28572ZM10.7144 9.14287C10.6007 9.14287 10.4917 9.18802 10.4113 9.26839C10.3309 9.34876 10.2858 9.45777 10.2858 9.57144C10.2858 9.6851 10.3309 9.79411 10.4113 9.87448C10.4917 9.95486 10.6007 10 10.7144 10H12.1429C12.2566 10 12.3656 9.95486 12.446 9.87448C12.5263 9.79411 12.5715 9.6851 12.5715 9.57144C12.5715 9.45777 12.5263 9.34876 12.446 9.26839C12.3656 9.18802 12.2566 9.14287 12.1429 9.14287H10.7144Z" fill="#a9a9a9"/>
                      </svg>
                      <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                        WALLET
                      </Text>
                      </HStack>
                      <Spacer/>
                      <HStack>
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M13.0094 2.99061C11.6875 1.66874 9.54849 1.66874 8.22817 2.99061L6.71411 4.50468L7.51099 5.30155L9.02505 3.78749C9.86567 2.94686 11.2844 2.8578 12.2125 3.78749C13.1422 4.71718 13.0532 6.13436 12.2125 6.97499L10.6985 8.48905L11.4969 9.28749L13.011 7.77343C14.3297 6.45155 14.3297 4.31249 13.0094 2.99061V2.99061ZM6.97661 12.2125C6.13599 13.0531 4.71724 13.1422 3.78911 12.2125C2.85942 11.2828 2.94849 9.86561 3.78911 9.02499L5.30317 7.51093L4.50474 6.71249L2.99067 8.22655C1.6688 9.54843 1.6688 11.6875 2.99067 13.0078C4.31255 14.3281 6.45161 14.3297 7.77192 13.0078L9.28599 11.4937L8.48911 10.6969L6.97661 12.2125V12.2125ZM4.06724 3.27186C4.04374 3.2486 4.01202 3.23555 3.97896 3.23555C3.94589 3.23555 3.91417 3.2486 3.89067 3.27186L3.27192 3.89061C3.24866 3.91411 3.23561 3.94583 3.23561 3.97889C3.23561 4.01196 3.24866 4.04368 3.27192 4.06718L11.9344 12.7297C11.9829 12.7781 12.0625 12.7781 12.111 12.7297L12.7297 12.1109C12.7782 12.0625 12.7782 11.9828 12.7297 11.9344L4.06724 3.27186Z" fill="#a9a9a9"/>
                      </svg>
                      <button onClick={() => {window.localStorage.walletName = "";localStorage.removeItem('license');window.location.reload();}}>
                      <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                        DISCONNECT
                      </Text>
                      </button>
                      </HStack>
                    </Flex>
                    {!wallet.connected ? (
                      <ConnectButton>Click to connect</ConnectButton>
                    ) :
                      (
                        <Box w="360px" h="40px" bg="#141414" borderRadius="5px" textAlign="center" color="white" paddingTop="12px">
                          <Center>
                            <HStack>
                            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M7 14C3.1339 14 0 10.8661 0 7C0 3.1339 3.1339 0 7 0C10.8661 0 14 3.1339 14 7C14 10.8661 10.8661 14 7 14ZM6.3021 9.8L11.2511 4.8503L10.2613 3.8605L6.3021 7.8204L4.3218 5.8401L3.332 6.8299L6.3021 9.8Z" fill="white"/>
                            </svg>
                            <Text fontSize="12px" fontFamily="Inter" color="white">
                              Connected
                            </Text>
                            </HStack>
                          </Center>

                        </Box>
                      )

                    }
                  </Stack>
                </Center>
              </Box>
              <Box h="240px" w="400px" bg="#1E1E1E" border="1px" borderColor={"#313131"} paddingTop="12px">
                <Center>
                  <Stack spacing={25}>
                    <Stack>
                    <Flex>
                      <HStack>
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2.81472 13.1853C3.12397 13.495 3.49137 13.7406 3.8958 13.9078C4.30023 14.0751 4.73373 14.1608 5.17139 14.16C5.60914 14.1608 6.04273 14.0751 6.44727 13.9078C6.85181 13.7405 7.21933 13.495 7.52872 13.1853L9.41406 11.2993L8.47139 10.3567L6.58606 12.2427C6.21037 12.6167 5.70184 12.8266 5.17172 12.8266C4.64161 12.8266 4.13308 12.6167 3.75739 12.2427C3.38306 11.8671 3.17286 11.3586 3.17286 10.8283C3.17286 10.2981 3.38306 9.78951 3.75739 9.414L5.64339 7.52866L4.70072 6.58599L2.81472 8.47133C2.19059 9.09697 1.84009 9.94461 1.84009 10.8283C1.84009 11.712 2.19059 12.5597 2.81472 13.1853V13.1853ZM13.1854 7.52866C13.8092 6.90285 14.1595 6.05527 14.1595 5.17166C14.1595 4.28805 13.8092 3.44047 13.1854 2.81466C12.5598 2.19053 11.7121 1.84003 10.8284 1.84003C9.94467 1.84003 9.09703 2.19053 8.47139 2.81466L6.58606 4.70066L7.52872 5.64333L9.41406 3.75733C9.78974 3.38332 10.2983 3.17335 10.8284 3.17335C11.3585 3.17335 11.867 3.38332 12.2427 3.75733C12.6171 4.13284 12.8273 4.64144 12.8273 5.17166C12.8273 5.70188 12.6171 6.21048 12.2427 6.58599L10.3567 8.47133L11.2994 9.414L13.1854 7.52866Z" fill="#a9a9a9"/>
                        <path d="M5.64255 11.3L4.69922 10.3573L10.3572 4.70001L11.2999 5.64335L5.64255 11.3Z" fill="#a9a9a9"/>
                        </svg>
                        <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                            CMID
                        </Text>
                      </HStack>
                        <Spacer/>
                        <Tooltip label="We are not liable for any lost money via scams, honeypots or any other method" aria-label='A tooltip' bg="#141414" placement="left-end" hasArrow arrowSize={9}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM7.5 10.375C7.5 10.4438 7.44375 10.5 7.375 10.5H6.625C6.55625 10.5 6.5 10.4438 6.5 10.375V6.125C6.5 6.05625 6.55625 6 6.625 6H7.375C7.44375 6 7.5 6.05625 7.5 6.125V10.375ZM7 5C6.80374 4.99599 6.61687 4.91522 6.47948 4.775C6.3421 4.63478 6.26515 4.4463 6.26515 4.25C6.26515 4.0537 6.3421 3.86522 6.47948 3.725C6.61687 3.58478 6.80374 3.50401 7 3.5C7.19626 3.50401 7.38313 3.58478 7.52052 3.725C7.6579 3.86522 7.73485 4.0537 7.73485 4.25C7.73485 4.4463 7.6579 4.63478 7.52052 4.775C7.38313 4.91522 7.19626 4.99599 7 5Z" fill="#F24E1E"/>
                          </svg>
                        </Tooltip>
                      </Flex>
                    <Stack spacing="25px">
                      <input className="cmidInput" placeholder="Enter Candy Machine ID" value={currentCmid} onInput={(e: React.ChangeEvent<HTMLInputElement> ) => {setCmid(e.target.value)}} onKeyPress={handleCmidInutKeyDown}/>
                      <Flex>
                        <HStack>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8.45592 2.68598C7.36619 2.59251 6.27406 2.83632 5.32756 3.3844C4.38106 3.93247 3.62594 4.75829 3.16455 5.74994C2.70316 6.74159 2.5578 7.85112 2.74818 8.92815C2.93857 10.0052 3.45548 10.9977 4.22886 11.771C5.00225 12.5444 5.99471 13.0613 7.07175 13.2517C8.14879 13.4421 9.25831 13.2967 10.25 12.8354C11.2416 12.374 12.0674 11.6188 12.6155 10.6723C13.1636 9.72584 13.4074 8.63371 13.3139 7.54398C13.2672 6.98385 13.1315 6.43474 12.9119 5.91732L13.9119 4.91598C14.4098 5.86757 14.6688 6.92599 14.6666 7.99998C14.6666 11.682 11.6819 14.6666 7.99992 14.6666C4.31792 14.6666 1.33325 11.682 1.33325 7.99998C1.33325 4.31798 4.31792 1.33332 7.99992 1.33332C9.07375 1.33236 10.1319 1.59129 11.0839 2.08798L10.0833 3.08798C9.56581 2.86848 9.01671 2.73278 8.45659 2.68598H8.45592ZM13.6566 1.39998L14.5999 2.34332L8.47192 8.47132L7.53059 8.47332L7.52925 7.52865L13.6566 1.39998Z" fill="#A9A9A9"/>
                          </svg>
                          <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                            AUTOMATIC MINT
                          </Text>
                        </HStack>
                        <Spacer/>
                        <Switch size='lg' colorScheme="all" onChange={isAutoMint} isChecked={isAutoMinting}/>
                      </Flex>
                    </Stack>
                    </Stack>
                    <Stack>
                      <Flex>
                        <HStack>
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7.4875 1.75001C7.52065 1.58756 7.48792 1.4186 7.39649 1.28029C7.30507 1.14198 7.16245 1.04566 7 1.01251C6.91957 0.99609 6.83668 0.995678 6.75609 1.01129C6.6755 1.02691 6.59877 1.05825 6.53029 1.10351C6.39198 1.19494 6.29565 1.33756 6.2625 1.50001L5.6 4.75001H2.625C2.45924 4.75001 2.30027 4.81585 2.18306 4.93306C2.06585 5.05027 2 5.20924 2 5.37501C2 5.54077 2.06585 5.69974 2.18306 5.81695C2.30027 5.93416 2.45924 6.00001 2.625 6.00001H5.3445L4.63 9.50001H2.125C1.95924 9.50001 1.80027 9.56585 1.68306 9.68306C1.56585 9.80027 1.5 9.95925 1.5 10.125C1.5 10.2908 1.56585 10.4497 1.68306 10.5669C1.80027 10.6842 1.95924 10.75 2.125 10.75H4.375L3.7625 13.75C3.74608 13.8304 3.74567 13.9133 3.76129 13.9939C3.7769 14.0745 3.80824 14.1512 3.85351 14.2197C3.89878 14.2882 3.95709 14.3471 4.02512 14.393C4.09315 14.439 4.16957 14.4711 4.25 14.4875C4.33043 14.5039 4.41332 14.5043 4.49391 14.4887C4.5745 14.4731 4.65123 14.4418 4.71971 14.3965C4.7882 14.3512 4.84709 14.2929 4.89304 14.2249C4.93899 14.1569 4.97108 14.0804 4.9875 14L5.651 10.75H9.125L8.513 13.75C8.49478 13.8311 8.49292 13.915 8.50752 13.9968C8.52212 14.0786 8.55289 14.1567 8.59803 14.2265C8.64318 14.2963 8.70178 14.3563 8.77042 14.4032C8.83906 14.45 8.91635 14.4827 8.99778 14.4994C9.0792 14.516 9.16313 14.5162 9.24464 14.5C9.32615 14.4838 9.40362 14.4515 9.4725 14.405C9.54138 14.3585 9.60029 14.2987 9.64579 14.2292C9.6913 14.1597 9.72247 14.0817 9.7375 14L10.4005 10.75H13.375C13.4571 10.75 13.5383 10.7338 13.6142 10.7024C13.69 10.671 13.7589 10.625 13.8169 10.5669C13.875 10.5089 13.921 10.44 13.9524 10.3642C13.9838 10.2884 14 10.2071 14 10.125C14 10.0429 13.9838 9.96166 13.9524 9.88583C13.921 9.81 13.875 9.7411 13.8169 9.68306C13.7589 9.62503 13.69 9.57899 13.6142 9.54758C13.5383 9.51617 13.4571 9.50001 13.375 9.50001H10.656L11.37 6.00001H13.875C14.0408 6.00001 14.1997 5.93416 14.3169 5.81695C14.4342 5.69974 14.5 5.54077 14.5 5.37501C14.5 5.20924 14.4342 5.05027 14.3169 4.93306C14.1997 4.81585 14.0408 4.75001 13.875 4.75001H11.625L12.2375 1.75001C12.2707 1.58756 12.2379 1.4186 12.1465 1.28029C12.0551 1.14198 11.9124 1.04566 11.75 1.01251C11.5876 0.979353 11.4186 1.01209 11.2803 1.10351C11.142 1.19494 11.0457 1.33756 11.0125 1.50001L10.35 4.75001H6.875L7.4875 1.75001ZM9.38 9.50001H5.906L6.62 6.00001H10.0945L9.38 9.50001Z" fill="#A9A9A9"/>
                          </svg>
                          <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                             MINT AMOUNT
                          </Text>
                        </HStack>
                        <Spacer/>
                        <Tooltip label="Requires auto-approve enabled in wallet" aria-label='A tooltip' bg="#141414" placement="left-end" hasArrow arrowSize={9}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM7.5 10.375C7.5 10.4438 7.44375 10.5 7.375 10.5H6.625C6.55625 10.5 6.5 10.4438 6.5 10.375V6.125C6.5 6.05625 6.55625 6 6.625 6H7.375C7.44375 6 7.5 6.05625 7.5 6.125V10.375ZM7 5C6.80374 4.99599 6.61687 4.91522 6.47948 4.775C6.3421 4.63478 6.26515 4.4463 6.26515 4.25C6.26515 4.0537 6.3421 3.86522 6.47948 3.725C6.61687 3.58478 6.80374 3.50401 7 3.5C7.19626 3.50401 7.38313 3.58478 7.52052 3.725C7.6579 3.86522 7.73485 4.0537 7.73485 4.25C7.73485 4.4463 7.6579 4.63478 7.52052 4.775C7.38313 4.91522 7.19626 4.99599 7 5Z" fill="#F24E1E"/>
                          </svg>
                        </Tooltip>
                      </Flex>
                      <NumberInput defaultValue={1} min={1} max={20} border="none" value={mintAmount} onChange={(valueAsNumber: any) => setMintAmount(parseInt(valueAsNumber))} allowMouseWheel>
                        <NumberInputField h="35px" w="360px" bg="#2f2f2f" color="white" border="none" />
                        <NumberInputStepper outline="none">
                          <NumberIncrementStepper color="white" border="none" />
                          <NumberDecrementStepper color="white" border="none"/>
                        </NumberInputStepper>
                      </NumberInput>
                    </Stack>
                  </Stack>
                </Center>
              </Box>
              <Box h="160px" w="400px" bg="#1E1E1E" border="1px" borderBottomRadius={"5px"} borderColor={"#313131"} paddingTop="12px">
                  <Center>
                  {!wallet.connected ? (
                      ""
                    ) : (
                      <>
                        <Box>
                          <Stack spacing="10px">
                        <Header
                          candyMachine={candyMachine}
                          onMint={onMint}
                          autoMint={isAutoMinting}
                        />

                          {candyMachine?.state.isActive &&
                          candyMachine?.state.gatekeeper &&
                          wallet.publicKey &&
                          wallet.signTransaction ? (
                            <GatewayProvider
                              wallet={{
                                publicKey:
                                  wallet.publicKey ||
                                  new PublicKey(CANDY_MACHINE_PROGRAM),
                                //@ts-ignore
                                signTransaction: wallet.signTransaction,
                              }}
                              gatekeeperNetwork={
                                candyMachine?.state?.gatekeeper?.gatekeeperNetwork
                              }
                              clusterUrl={rpcUrl}
                              options={{ autoShowModal: false }}
                            >
                              <MintButton
                                candyMachine={candyMachine}
                                isMinting={isUserMinting}
                                onMint={onMint}
                              />
                            </GatewayProvider>
                          ) : (
                            <MintButton
                              candyMachine={candyMachine}
                              isMinting={isUserMinting}
                              onMint={onMint}
                            />
                          )}
                          </Stack>
                        </Box>
                      </>
                    )}
                  </Center>
              </Box>
            </Stack>
          </Box>
        <Snackbar
          open={alertState.open}
          autoHideDuration={6000}
          onClose={() => setAlertState({ ...alertState, open: false })}
        >
          <Alert
            onClose={() => setAlertState({ ...alertState, open: false })}
            severity={alertState.severity}
          >
            {alertState.message}
          </Alert>
        </Snackbar>
        <Center marginTop="44px">
          <Text color="#A9A9A9" fontSize="12px">
            © 2022 HOVER MINT
          </Text>
        </Center>
      </Box>
    </div>
  );
};

export default Home;
