import './NavBar.css'
import {Box, Flex, HStack, Spacer, Text} from '@chakra-ui/react'
import Logo from "./img/logo.png"

interface NavBarProps {
  walletAddress: string,
}

export const NavBar = (props: NavBarProps) => {
  var walletAddressShort = 'Connect Wallet'

  if (props.walletAddress !== '') {
    walletAddressShort = props.walletAddress[0] + props.walletAddress[1] + props.walletAddress[2] + props.walletAddress[3] + "..." + props.walletAddress[props.walletAddress.length - 4] + props.walletAddress[props.walletAddress.length - 3] + props.walletAddress[props.walletAddress.length - 2] + props.walletAddress[props.walletAddress.length - 1];
    (document.getElementById('Avatar') as HTMLInputElement).src = `https://avatars.dicebear.com/api/bottts/${props.walletAddress}.svg`;
  }

  function logoutClick() {
    window.localStorage.walletName = "";
    window.location.reload();
  }

  return (
    <>
      <Box id="navbar" bg="#181818" w="100%" h="66px" paddingLeft="32px" paddingTop="16px" paddingRight="32px" borderBottom={"1px"} borderBottomColor="#313131">
        <Flex>
          <HStack spacing="13px">
            <img src={Logo} alt="Hovermint" style={{width: "32px", height: "32px"}}/>
            <Text color="white" fontFamily={"Roboto"} fontWeight={"bold"}>
              Hover Mint
            </Text>
          </HStack>
          <Spacer/>
          <HStack spacing="13px">
            <img id="Avatar" src={Logo} alt="Hovermint" style={{width: "36px", height: "36px", borderRadius:"69px"}}/>
            <Text color="white" fontFamily={"Roboto"} fontWeight={"bold"}>
              {walletAddressShort}
            </Text>
            <svg onClick={logoutClick} id="logoutBtn" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 23.5V17H11.9375C11.6723 17 11.4179 16.8946 11.2304 16.7071C11.0429 16.5196 10.9375 16.2652 10.9375 16C10.9375 15.7348 11.0429 15.4804 11.2304 15.2929C11.4179 15.1054 11.6723 15 11.9375 15H21V8.5C20.999 7.57205 20.6299 6.68238 19.9738 6.02622C19.3176 5.37006 18.428 5.00099 17.5 5H5.5C4.57205 5.00099 3.68238 5.37006 3.02622 6.02622C2.37006 6.68238 2.00099 7.57205 2 8.5V23.5C2.00099 24.428 2.37006 25.3176 3.02622 25.9738C3.68238 26.6299 4.57205 26.999 5.5 27H17.5C18.428 26.999 19.3176 26.6299 19.9738 25.9738C20.6299 25.3176 20.999 24.428 21 23.5V23.5Z" fill="#4e4d4d"/>
              <path d="M26.5856 17L23.2931 20.2931C23.1135 20.4822 23.0148 20.734 23.0182 20.9947C23.0215 21.2555 23.1266 21.5046 23.311 21.689C23.4954 21.8734 23.7445 21.9785 24.0053 21.9818C24.2661 21.9852 24.5178 21.8865 24.7069 21.7069L29.7069 16.7069C29.8943 16.5194 29.9995 16.2651 29.9995 16C29.9995 15.7349 29.8943 15.4807 29.7069 15.2931L24.7069 10.2931C24.5178 10.1135 24.2661 10.0149 24.0053 10.0182C23.7445 10.0215 23.4954 10.1266 23.311 10.311C23.1266 10.4954 23.0215 10.7446 23.0182 11.0053C23.0148 11.2661 23.1135 11.5178 23.2931 11.7069L26.5856 15H21V17H26.5856Z" fill="#4e4d4d"/>
            </svg>

          </HStack>
        </Flex>
      </Box>
    </>
  )
}
