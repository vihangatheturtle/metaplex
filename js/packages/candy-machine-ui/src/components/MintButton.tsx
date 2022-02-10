import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { CandyMachineAccount } from '../utils/candy-machine';
import { CircularProgress } from '@material-ui/core';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';
import { useEffect, useState } from 'react';


export const CTAButton = styled(Button)`
  width: 360px;
  height: 50px;
  margin-top: 10px;
  margin-bottom: 5px;
  background: linear-gradient(180deg, #e682ff 0%, #db4dff 100%);
  color: white;
  font-size: 16px;
  font-weight: bold;
`; // add your own styles here


export const MintButton = ({
  onMint,
  candyMachine,
  isMinting,
  isDisabled,
}: {
  onMint: () => Promise<boolean>;
  candyMachine?: CandyMachineAccount;
  isMinting: boolean;
  isDisabled: boolean;
}) => {
  const { requestGatewayToken, gatewayStatus } = useGateway();
  const [clicked, setClicked] = useState(false);
  const [buttonData, setButtonData] = useState<String | JSX.Element>("Loading...");

  useEffect(() => {
    if (gatewayStatus === GatewayStatus.ACTIVE && clicked) {
      onMint();
      setClicked(false);
    }
  }, [gatewayStatus, clicked, setClicked, onMint]);

  useEffect(() => {
    if (candyMachine?.state.isSoldOut) {
      setButtonData('SOLD OUT');
    } else if (isMinting) {
      setButtonData(<CircularProgress />);
    } else if (candyMachine?.state.isPresale) {
      setButtonData('PRESALE');
    } else if (clicked && candyMachine?.state.gatekeeper) {
      setButtonData(<CircularProgress />);
    }
    else {
    setButtonData('Start Minting');
    }
  }, [candyMachine?.state.gatekeeper, candyMachine?.state.isPresale, candyMachine?.state.isSoldOut, clicked, isDisabled, isMinting])

  //const getMintButtonContent = () => {
  //  if (candyMachine?.state.isSoldOut) {
  //    return 'SOLD OUT';
  //  } else if (isMinting) {
  //    return <CircularProgress />;
  //  } else if (candyMachine?.state.isPresale) {
  //    return 'PRESALE';
  //  } else if (clicked && candyMachine?.state.gatekeeper) {
  //    return <CircularProgress />;
  //  }
//
  //  return 'Start Minting';
  //};

  return (
    <CTAButton
      id="NFTMintButton"
      disabled={
        (isDisabled ||
        clicked) || candyMachine?.state.isSoldOut
      }
      onClick={async () => {
        setClicked(true);
        if (candyMachine?.state.isActive && candyMachine?.state.gatekeeper) {
          if (gatewayStatus === GatewayStatus.ACTIVE) {
            setClicked(true);
          } else {
            await requestGatewayToken();
          }
        } else {
          await onMint();
          setClicked(false);
        }
      }}
      variant="contained"
      className={`${isDisabled || candyMachine?.state.isSoldOut ? '' : 'mint-button'}`}
    >
      {buttonData}
    </CTAButton>
  );
};
