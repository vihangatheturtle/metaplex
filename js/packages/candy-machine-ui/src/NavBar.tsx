import './NavBar.css'
import {Box, Center, Flex, HStack, Spacer, Text} from '@chakra-ui/react'
import Logo from "./img/logo.png"

export const NavBar = () => {
    return (
      <>
        <Box bg="#181818" w="100%" h="64px" paddingLeft="32px" paddingTop="16px" paddingRight="32px" borderBottom={"1px"} borderBottomColor="#313131">
          <Flex>
            <HStack spacing="13px">
              <img src={Logo} alt="Hovermint" style={{width: "32px", height: "32px"}}/>
              <Text color="white" fontFamily={"Roboto"} fontWeight={"bold"}>
                Hover Mint
              </Text>
            </HStack>
            <Spacer/>
            <HStack spacing="13px">
              <img src={Logo} alt="Hovermint" style={{width: "32px", height: "32px"}}/>
              <Text color="white" fontFamily={"Roboto"} fontWeight={"bold"}>
                Fancy Shake
              </Text>
            </HStack>
          </Flex>
        </Box>
      </>
    )
}
