//import { Paper } from '@material-ui/core';
import Countdown from 'react-countdown';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { CandyMachineAccount } from './candy-machine';
import {Box, Flex, Spacer, Text, Stack} from '@chakra-ui/react'

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
  onComplete?: () => void;
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

function AutoMint(onMint: () => Promise<boolean>) {
  setTimeout(async () => {
     const check: boolean = await onMint();
     if (check) {
      (document.getElementById('NFTMintButton') as HTMLInputElement).disabled = true;
      (document.getElementById('NFTMintButton') as HTMLInputElement).innerHTML = 'AutoMint In Progress';
     }
  }, 2000);
}

export const MintCountdown: React.FC<MintCountdownProps> = ({
  date,
  status,
  style,
  onComplete,
  onm,
  autoMint,
}) => {
  //const classes = useStyles(); idk why this is here
  useStyles();
  const renderCountdown = ({
    days,
    hours,
    minutes,
    seconds,
    completed,
  }: MintCountdownRender) => {
    hours += days * 24;
    if (completed) {
      console.log("Countdown complete");
      try {
        if (autoMint) {
          AutoMint(onm)
        }
      } catch { }
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
      <Countdown
        date={date}
        onComplete={onComplete}
        renderer={renderCountdown}
      />
    );
  } else {
    return <span>Lodaing..</span>;
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

