import * as anchor from '@project-serum/anchor';

//import Grid from '@material-ui/core/Grid';
//import Typography from '@material-ui/core/Typography';
import { MintCountdown } from './MintCountdown';
import { toDate, formatNumber } from './utils';
import { CandyMachineAccount } from './candy-machine';
import { Flex, HStack, Spacer, Text, Stack } from '@chakra-ui/react'

type HeaderProps = {
  candyMachine?: CandyMachineAccount;
  onMint: () => Promise<boolean>;
  autoMint: boolean;
};

export const Header = ({ candyMachine, onMint, autoMint }: HeaderProps) => {

  const getType = () => {

      if (candyMachine?.state.isPresale) {
          return 'Presale';
      }

      return 'Live';
  }

  return (
    <Flex>
        {candyMachine && (
            <HStack spacing="41px">
            <Stack spacing={"8px"}>
              <Text fontSize="12px" fontWeight="500" fontFamily={"Inter"} color="#A9A9A9">
                TYPE
              </Text>
              <Text fontSize="18px" fontWeight="500" fontFamily={"Inter"} color="white">
                {getType()}
              </Text>
            </Stack>
            <Stack spacing={"8px"}>
              <Text fontSize="12px" fontWeight="500" fontFamily={"Inter"} color="#A9A9A9">
                PRICE
              </Text>
              <Text fontSize="18px" fontWeight="500" fontFamily={"Inter"} color="white">
                {getMintPrice(candyMachine)}
              </Text>
            </Stack>
            </HStack>
        )}
        <Spacer/>
        <MintCountdown
          date={toDate(
            candyMachine?.state.goLiveDate
              ? candyMachine?.state.goLiveDate
              : candyMachine?.state.isPresale
              ? new anchor.BN(new Date().getTime() / 1000)
              : undefined,
          )}
          style={{ justifyContent: 'flex-end' }}
          status={
            !candyMachine?.state?.isActive || candyMachine?.state?.isSoldOut
              ? 'COMPLETED'
              : candyMachine?.state.isPresale
              ? 'PRESALE'
              : 'LIVE'
          }
          onm={onMint}
          autoMint={autoMint}
        />
</Flex>
  );
};

const getMintPrice = (candyMachine: CandyMachineAccount): string => {
  const price = formatNumber.asNumber(
    candyMachine.state.isPresale && candyMachine.state.whitelistMintSettings?.discountPrice
      ? candyMachine.state.whitelistMintSettings?.discountPrice!
      : candyMachine.state.price!,
  );
  return `◎ ${price}`;
};
//<Grid container direction="row" wrap="nowrap">
//<Grid container direction="column">
//  <Typography variant="body2" color="textSecondary">
//    Type
//  </Typography>
//  <Typography
//    color="textPrimary"
//    style={{
//      fontWeight: 'bold',
//      fontSize:"18px"
//    }}
//  >
//    {`${getType()}`}
//  </Typography>
//</Grid>
//<Grid container direction="column">
//  <Typography variant="body2" color="textSecondary">
//    Price
//  </Typography>
//  <Typography
//    color="textPrimary"
//    style={{ fontWeight: 'bold',
//    fontSize:"18px" }}
//  >
//    {getMintPrice(candyMachine)}
//  </Typography>
//</Grid>
//</Grid>
