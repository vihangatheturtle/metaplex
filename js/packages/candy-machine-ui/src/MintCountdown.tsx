import { Paper } from '@material-ui/core';
import Countdown from 'react-countdown';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { CandyMachineAccount } from './candy-machine';
import {Box, Center, Flex, HStack, Spacer, Text, Stack, Switch} from '@chakra-ui/react'
import { useEffect, useState } from 'react';
import { GatewayStatus, useGateway } from '@civic/solana-gateway-react';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      display: 'flex',
      padding: theme.spacing(0),
      '& > *': {
        margin: theme.spacing(0.5),
        marginRight: 0,
        width: theme.spacing(6),
        height: theme.spacing(6),
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#384457',
        color: 'white',
        borderRadius: 5,
        fontSize: 10,
      },
    },
    done: {
      display: 'flex',
      margin: theme.spacing(1),
      marginRight: 0,
      padding: theme.spacing(1),
      flexDirection: 'column',
      alignContent: 'center',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#384457',
      color: 'white',
      borderRadius: 5,
      fontWeight: 'bold',
      fontSize: 18,
    },
    item: {
      fontWeight: 'bold',
      fontSize: 18,
    },
  }),
);

interface MintCountdownProps {
  date: Date | undefined;
  style?: React.CSSProperties;
  status?: string;
  cm?: CandyMachineAccount;
  onm: () => Promise<boolean>;
  autoMint: boolean;
}

interface MintCountdownRender {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}


export const MintCountdown: React.FC<MintCountdownProps> = ({ date, status, style, onm, autoMint, }) => {
  const classes = useStyles();
  const [autoMintState, setAutoMintState] = useState(true);
  const { requestGatewayToken, gatewayStatus } = useGateway();

  //async function AutoMint(onMint: () => Promise<boolean>) {
  //  const delay = (ms: any) => new Promise(res => setTimeout(res, ms));
  //  await delay(2000);
  //  let check;
  //  if (autoMintState) {
  //    check = await onMint();
  //  }
//
  //  if (check) {
  //  (document.getElementById('NFTMintButton') as HTMLInputElement).disabled = true;
  //  (document.getElementById('NFTMintButton') as HTMLInputElement).innerHTML = 'AutoMint In Progress';
  //  }
  //  else {
  //    setAutoMintState(false);
  //  }
  //}

  useEffect(() => {
    if (checkIfMidnight(date)){
    try {
      if (autoMint) {
        console.log(gatewayStatus)
        if (gatewayStatus === GatewayStatus.ACTIVE) {
          onm();
        }
        else {

          requestGatewayToken()
        }
      }
    } catch { }
  }
  }, [date, autoMint, gatewayStatus, onm, requestGatewayToken]);

  const checkIfMidnight = (date: Date | undefined) => {
    if (date === undefined)
        return false;
    if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
      return true;
    }
    return false;
  }

  const renderCountdown = (date: Date | undefined) => {
    if (date === undefined)
      return <div>No Date</div>;
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var seconds = date.getSeconds();
    var days = date.getDate();
    hours += days * 24;
    if (checkIfMidnight(date)) {
      console.log("Countdown complete");
      console.log(status)
      return status ? (
        <Stack spacing={"-8px"} paddingTop="2px">
          <Flex>
            <Spacer/>
          <Text fontSize="12px" paddingTop="2px" fontWeight="500" fontFamily={"Inter"} color="#A9A9A9">
            COUNTDDOWN
          </Text>
        </Flex>
        <Text fontSize="30px" paddingTop="2px" fontWeight="bold" fontFamily={"Inter"} color="white">
          Completed
        </Text>
      </Stack>) : null;
    } else {
      return (
        <Box>
            <Text fontSize="lg" fontWeight="bold" fontFamily={"Inter"} color="white">
            {hours < 10 ? `0${hours}` : hours}:{minutes < 10 ? `0${minutes}` : minutes}:{seconds < 10 ? `0${seconds}` : seconds}
            </Text>
        </Box>
      );
    }
  };

  if (date) {
    return (
      renderCountdown(date)
    );
  } else {
    return <span>Loading..</span>;
  }

};

//<div className={classes.root} style={style}>
//<Paper elevation={0}>
//  <span className={classes.item}>
//    {hours < 10 ? `0${hours}` : hours}
//  </span>
//  <span>hrs</span>
//</Paper>
//<Paper elevation={0}>
//  <span className={classes.item}>
//    {minutes < 10 ? `0${minutes}` : minutes}
//  </span>
//  <span>mins</span>
//</Paper>
//<Paper elevation={0}>
//  <span className={classes.item}>
//    {seconds < 10 ? `0${seconds}` : seconds}
//  </span>
//  <span>secs</span>
//</Paper>
//</div>

