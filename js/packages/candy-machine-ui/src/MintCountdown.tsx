import { Paper } from '@material-ui/core';
import Countdown from 'react-countdown';
import { Theme, createStyles, makeStyles } from '@material-ui/core/styles';
import { CandyMachineAccount } from './candy-machine';

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
  onm: () => Promise<void>;
}

interface MintCountdownRender {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  completed: boolean;
}

function AutoMint(onMint: () => Promise<void>) {
  setTimeout(async () => {
    (document.getElementById('NFTMintButton') as HTMLInputElement).disabled = true;
    (document.getElementById('NFTMintButton') as HTMLInputElement).innerHTML = 'AutoMint In Progress';
    await onMint();
  }, 2000);
}

export const MintCountdown: React.FC<MintCountdownProps> = ({
  date,
  status,
  style,
  onComplete,
  onm,
}) => {
  const classes = useStyles();
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
      if ((document.getElementById('autoMintCheckbox') as HTMLInputElement).checked) {
        AutoMint(onm)
      }
      return status ? <span className={classes.done}>{status}</span> : null;
    } else {
      return (
        <div className={classes.root} style={style}>
          <Paper elevation={0}>
            <span className={classes.item}>
              {hours < 10 ? `0${hours}` : hours}
            </span>
            <span>hrs</span>
          </Paper>
          <Paper elevation={0}>
            <span className={classes.item}>
              {minutes < 10 ? `0${minutes}` : minutes}
            </span>
            <span>mins</span>
          </Paper>
          <Paper elevation={0}>
            <span className={classes.item}>
              {seconds < 10 ? `0${seconds}` : seconds}
            </span>
            <span>secs</span>
          </Paper>
        </div>
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
    return null;
  }
};
