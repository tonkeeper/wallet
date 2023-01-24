import React from 'react';
import { StyleSheet } from 'react-native';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Button, DevSeparator, Screen } from '$uikit';
import { openSignRawModal } from '$core/ModalContainer/NFTOperations/Modals/SignRawModal';
import { getTimeSec } from '$utils/getTimeSec';

const getExpiresSec = () => {
  return getTimeSec() + 10 * 60;
};

const response_options = {
  broadcast: false,
};

export const DevSignRawExamples: React.FC = () => {
  return (
    <Screen>
      <Screen.Header title="Sign Raw Examples" rightContent={<AttachScreenButton />} />
      <Screen.ScrollView>
        <Button
          onPress={() => {
            openSignRawModal(
              {
                source: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                valid_until: getExpiresSec(),
                messages: [
                  {
                    address: 'EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS',
                    amount: '20000000',
                    payload:
                      'te6cckECEQEAA40AAogAAAABloNCGq22qtxVIPjDxIl+7W9igcDUCviduVHT73hZO7fxkSxf/WCpX1QGZL7rlm5AjfDqDty6q6wsEvEJd9n1AAIBAAACATQFAwGZMYkUBsAFhO5hst/wg3EW0Py1B42TlkvL6cBf1qFBsb/KXWpD4YgAG4vTn/eUu5RLYJVro7/vZ3EX3cOKYpXbOFySWq7dqk4oEqBfIAIEAJeAFHJrDD7ztes0J62jBcLIBCGAXzHHvjH7TpcetWKDV+MIO5rKAQA9jZg/5R+X+btSo9ynxsk74WUl9BIOqqdmuSEFCl8ThtAX14QCART/APSkE/S88sgLBgIBIAgHAH7yMO1E0NMA0x/6QPpA+kD6ANTTADDAAY4d+ABwB8jLABbLH1AEzxZYzxYBzxYB+gLMywDJ7VTgXweCAP/+8vACAUgKCQBXoDhZ2omhpgGmP/SB9IH0gfQBqaYAYGGh9IH0AfSB9ABhBCCMkrCgFYACqwECAs0NCwH3ZghA7msoAUmCgUjC+8uHCJND6QPoA+kD6ADBTkqEhoVCHoRagUpBwgBDIywVQA88WAfoCy2rJcfsAJcIAJddJwgKwjhdQRXCAEMjLBVADzxYB+gLLaslx+wAQI5I0NOJacIAQyMsFUAPPFgH6AstqyXH7AHAgghBfzD0UgwAlsjLHxPLPyPPFlADzxbKAIIJycOA+gLKAMlxgBjIywUmzxZw+gLLaszJgwb7AHFVUHAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVAP10A6GmBgLjYSS+CcH0gGHaiaGmAaY/9IH0gfSB9AGppgBgYOCmE44BgAEwthGmP6Z+lVW8Q4AHxgRDAgRXdFOAA2CnT44LYTwhWL4ZqGGhpg+oYAP2AcBRgAPloyhJrpOEBWfGBHByUYABOGxuIHCOyiiGYOHgC8BRgAMEA8OAC6SXwvgCMACmFVEECQQI/AF4F8KhA/y8ACAMDM5OVNSxwWSXwngUVHHBfLh9IIQBRONkRW68uH1BPpAMEBmBXAHyMsAFssfUATPFljPFgHPFgH6AszLAMntVADYMTc4OYIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxXLPyfPFifPFhTKACP6AhPKAMmAQPsAcVBmRRUEcAfIywAWyx9QBM8WWM8WAc8WAfoCzMsAye1Uu1DVhw==',
                  },
                  {
                    address: 'EQAoyPaXbJF7mmNjIbnAEj80XQZI3ePdddxoF_fbVdn9QneP',
                    amount: '40000000',
                    payload:
                      'te6cckEBAQEAVQAApV/MPRQAAAAAAAAAAIAbWIRerdFeW5Y/9AHtsCr2HYXvQaOrWgiKbL+a508UfZAD2NmD/lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOGxzEtAIdWPntA==',
                  },
                ],
              },
              {
                expires_sec: getExpiresSec(),
                response_options,
              },
            );
          }}
        >
          Sale place GetGems NFT
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            openSignRawModal(
              {
                source: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                valid_until: getExpiresSec(),
                messages: [
                  {
                    address: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                    amount: '100000000',
                  },
                  {
                    address: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                    amount: '10000000',
                    payload: 'te6ccsEBAQEADgAAABgAAAAAQ29tbWVudCE07Pl9',
                  },
                ],
              },
              {
                expires_sec: getExpiresSec(),
                response_options,
              },
            );
          }}
        >
          Two transfers
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            openSignRawModal(
              {
                source: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                valid_until: getExpiresSec(),
                messages: [
                  {
                    address: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                    amount: '10000000',
                    payload: 'te6ccsEBAQEADgAAABgAAAAAQ29tbWVudCE07Pl9',
                  },
                ],
              },
              {
                expires_sec: getExpiresSec(),
                response_options,
              },
            );
          }}
        >
          One transfer with payload
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            openSignRawModal(
              {
                source: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                valid_until: getExpiresSec(),
                messages: [
                  {
                    address: 'EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n',
                    amount: '100000000000000',
                  },
                ],
              },
              {
                expires_sec: getExpiresSec(),
                response_options,
              },
            );
          }}
        >
          Transfer with huge amount
        </Button>
      </Screen.ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  text: {
    marginBottom: 16,
    marginHorizontal: 12,
  },
});
