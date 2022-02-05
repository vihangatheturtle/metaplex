import { useEffect, useMemo, useState, useCallback } from 'react';
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
/*
import { AutoMintCheckbox } from './AutoMint'
import { MintAmount } from './CandyMintAmount';
import { AppNote } from './AppNote';
import { CMInput } from './cmInput';
*/ // ADD LATER
import { mintMultipleTokens } from './candy-machine';
import {Box, Center, Flex, HStack, Spacer, Text, Stack, Switch} from '@chakra-ui/react'

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

  const rpcUrl = props.rpcHost;
  const wallet = useWallet();

  useEffect(() => {
    if (props.rawCandyMachineID) {
      setCmid(props.rawCandyMachineID)
    }
  }, [props.rawCandyMachineID]);

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

  const onMint = async () => {
    async function mintTokenEZ(amount: number) {
      if (amount === 1) {
        try {
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
        }
      } else if (amount > 1) {
        if (wallet.connected && candyMachine?.program && wallet.publicKey) {
          await mintMultipleTokens(candyMachine, wallet.publicKey, amount, props.txTimeout, props.connection, mintSuccess, mintFailure);
        }
      }
    }
    var cmAmount = 1;
    if (!isNaN(parseInt((document.getElementById('candyMintAmount') as HTMLInputElement).value))) {
      cmAmount = parseInt((document.getElementById('candyMintAmount') as HTMLInputElement).value);
    }
    mintTokenEZ(cmAmount)
  };

  useEffect(() => {
    refreshCandyMachineState();
  }, [
    anchorWallet,
    props.candyMachineId,
    props.connection,
    refreshCandyMachineState,
  ]);





  return (
    <Box style={{ marginTop: 100 }}>
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
                    <button onClick={() => {window.localStorage.walletName = "";window.location.reload();}}>
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
            <Box h="140px" w="400px" bg="#1E1E1E" border="1px" borderColor={"#313131"} paddingTop="12px">
              <Center>
                <Stack>
                  <HStack>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M2.81472 13.1853C3.12397 13.495 3.49137 13.7406 3.8958 13.9078C4.30023 14.0751 4.73373 14.1608 5.17139 14.16C5.60914 14.1608 6.04273 14.0751 6.44727 13.9078C6.85181 13.7405 7.21933 13.495 7.52872 13.1853L9.41406 11.2993L8.47139 10.3567L6.58606 12.2427C6.21037 12.6167 5.70184 12.8266 5.17172 12.8266C4.64161 12.8266 4.13308 12.6167 3.75739 12.2427C3.38306 11.8671 3.17286 11.3586 3.17286 10.8283C3.17286 10.2981 3.38306 9.78951 3.75739 9.414L5.64339 7.52866L4.70072 6.58599L2.81472 8.47133C2.19059 9.09697 1.84009 9.94461 1.84009 10.8283C1.84009 11.712 2.19059 12.5597 2.81472 13.1853V13.1853ZM13.1854 7.52866C13.8092 6.90285 14.1595 6.05527 14.1595 5.17166C14.1595 4.28805 13.8092 3.44047 13.1854 2.81466C12.5598 2.19053 11.7121 1.84003 10.8284 1.84003C9.94467 1.84003 9.09703 2.19053 8.47139 2.81466L6.58606 4.70066L7.52872 5.64333L9.41406 3.75733C9.78974 3.38332 10.2983 3.17335 10.8284 3.17335C11.3585 3.17335 11.867 3.38332 12.2427 3.75733C12.6171 4.13284 12.8273 4.64144 12.8273 5.17166C12.8273 5.70188 12.6171 6.21048 12.2427 6.58599L10.3567 8.47133L11.2994 9.414L13.1854 7.52866Z" fill="#a9a9a9"/>
                  <path d="M5.64255 11.3L4.69922 10.3573L10.3572 4.70001L11.2999 5.64335L5.64255 11.3Z" fill="#a9a9a9"/>
                  </svg>
                  <Text paddingTop="1px" fontSize="12px" fontFamily="Inter" color="#a9a9a9">
                      CMID
                  </Text>
                  </HStack>
                  <Stack spacing="25px">
                    <input className="cmidInput" placeholder="Enter Candy Machine ID" value={currentCmid} onInput={(e: React.ChangeEvent<HTMLInputElement> ) => {setCmid(e.target.value)}}/>
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
                      <Switch size='lg' colorScheme="all" defaultIsChecked/>
                    </Flex>
                  </Stack>
                </Stack>
              </Center>
            </Box>
            <Box h="150px" w="400px" bg="#1E1E1E" border="1px" borderBottomRadius={"5px"} borderColor={"#313131"} paddingTop="12px">
                <Center>
                {!wallet.connected ? (
                    ""
                  ) : (
                    <>
                      <Box>
                        <Stack spacing="15px">
                      <Header
                        candyMachine={candyMachine}
                        onMint={onMint}
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
    </Box>
  );
};

export default Home;
