import React from 'react';
import { AttachScreenButton } from '$navigation/AttachScreen';
import { Button, DevSeparator, Screen, Text } from '$uikit';
import { useDeeplinking } from '$libs/deeplinking';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getTimeSec } from '$utils/getTimeSec';
import { Base64 } from '$utils';

const getExpiresSec = () => {
  return getTimeSec() + 10 * 60;
};

export const DevDeeplinking: React.FC = () => {
  const deeplinking = useDeeplinking();
  const { bottom: paddingBottom } = useSafeAreaInsets();

  const handleTwoTransfers = () => {
    const data = Base64.encodeObj({
      version: '0',
      body: {
        type: 'sign-raw-payload',
        default: {
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
        params: {
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
        response_options: {
          callback_url: 'https://txrequest.testtonlogin.xyz/api/complete',
          return_url: 'https://txrequest.testtonlogin.xyz/api/complete',
          broadcast: true,
        },
        expires_sec: getExpiresSec(),
      },
    });
    deeplinking.resolve(`https://app.tonkeeper.com/v1/txrequest-inline/${data}`);
  };

  return (
    <Screen>
      <Screen.Header title="Deeplinking" rightContent={<AttachScreenButton />} />
      <Screen.ScrollView contentContainerStyle={{ paddingBottom }}>
        <Text variant="h2">sign-raw-payload</Text>

        <DevSeparator />
        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/transfer/EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n?amount=10000000&bin=te6ccsEBAQEADgAAABgAAAAAQ29tbWVudCE07Pl9',
            );
          }}
        >
          Transfer with bin (text comment)
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/transfer/EQB4CJZ-9mA8hOffGjSiD_XkvzYiRNAtXv68RjyTHJ9YIDyq?amount=100000000&init=te6cckECJwEABMUAAgE0EwEDU4Aexswf8o%2FL%2FN2pUe5T42Sd8LKS%2BgkHVVOzXJCChS%2BJw2AAAAAAAAAAEBADAgBLAAoAZIAexswf8o%2FL%2FN2pUe5T42Sd8LKS%2BgkHVVOzXJCChS%2BJw3ABFP8A9KQT9LzyyAsEAgFiBgUACaEfn%2BAFAgLOCgcCASAJCAAdAPIyz9YzxYBzxbMye1UgADs7UTQ0z%2F6QCDXScIAmn8B%2BkDUMBAkECPgMHBZbW2ACASAMCwARPpEMHC68uFNgAtcMiHHAJJfA%2BDQ0wMBcbCSXwPg%2BkD6QDH6ADFx1yH6ADH6ADDwAgSzjhQwbCI0UjLHBfLhlQH6QNQwECPwA%2BAG0x%2FTP4IQX8w9FFIwuo6HMhA3XjJAE%2BAwNDQ1NYIQL8smohK64wJfBIQP8vCAODQBycIIQi3cXNQXIy%2F9QBM8WECSAQHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAAfZRNccF8uGR%2BkAh8AH6QNIAMfoAggr68IAboSGUUxWgod4i1wsBwwAgkgahkTbiIML%2F8uGSIY4%2BghAFE42RyFAJzxZQC88WcSRJFFRGoHCAEMjLBVAHzxZQBfoCFctqEssfyz8ibrOUWM8XAZEy4gHJAfsAEEeUECo3W%2BIPAIICjjUm8AGCENUydtsQN0QAbXFwgBDIywVQB88WUAX6AhXLahLLH8s%2FIm6zlFjPFwGRMuIByQH7AJMwMjTiVQLwAwIAEhEAaGh0dHBzOi8vcy5nZXRnZW1zLmlvL25mdC9jLzYzMTVlOTZhYjE0NzdhYWRkMjlmOTBjMi8AfAFodHRwczovL3MuZ2V0Z2Vtcy5pby9uZnQvYy82MzE1ZTk2YWIxNDc3YWFkZDI5ZjkwYzIvbWV0YS5qc29uART%2FAPSkE%2FS88sgLFAIBYhwVAgEgFxYAJbyC32omh9IGmf6mpqGC3oahgsQCASAbGAIBIBoZAC209H2omh9IGmf6mpqGAovgngCOAD4AsAAvtdr9qJofSBpn%2Bpqahg2IOhph%2BmH%2FSAYQAEO4tdMe1E0PpA0z%2FU1NQwECRfBNDUMdQw0HHIywcBzxbMyYAgLNIh0CASAfHgA9Ra8ARwIfAFd4AYyMsFWM8WUAT6AhPLaxLMzMlx%2BwCAIBICEgABs%2BQB0yMsCEsoHy%2F%2FJ0IAAtAHIyz%2F4KM8WyXAgyMsBE%2FQA9ADLAMmAE59EGOASK3wAOhpgYC42Eit8H0gGADpj%2Bmf9qJofSBpn%2BpqahhBCDSenKgpQF1HFBuvgoDoQQhUZYBWuEAIZGWCqALnixJ9AQpltQnlj%2BWfgOeLZMAgfYBwGyi544L5cMiS4ADxgRLgAXGBEuAB8YEYGYHgAkJiUkIwA8jhXU1DAQNEEwyFAFzxYTyz%2FMzMzJ7VTgXwSED%2FLwACwyNAH6QDBBRMhQBc8WE8s%2FzMzMye1UAKY1cAPUMI43gED0lm%2BlII4pBqQggQD6vpPywY%2FegQGTIaBTJbvy9AL6ANQwIlRLMPAGI7qTAqQC3gSSbCHis%2BYwMlBEQxPIUAXPFhPLP8zMzMntVABgNQLTP1MTu%2FLhklMTugH6ANQwKBA0WfAGjhIBpENDyFAFzxYTyz%2FMzMzJ7VSSXwXiAEklGw%3D%3D',
            );
          }}
        >
          Transfer with init (deploy collection)
        </Button>

        <DevSeparator />
        <Button onPress={handleTwoTransfers}>Two transfers (txrequest-inline)</Button>

        <DevSeparator />

        <Text variant="h2">NFT (txrequest-url)</Text>
        <DevSeparator />
        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-single-deploy.json?contractAddress=EQACwW3us-Pc4NRiSa3TZF0s0Ujh8N3tssj7luR07MsJILKJ&itemContentUri=https%3A%2F%2Fs.getgems.io%2Fnft%2Fs%2F628f%2F628fa3924345ba6eeb37b08a%2Fmeta.json&stateInitHex=b5ee9c72410219010003c30002013404010285801ec6cc1ff28fcbfcdda951ee53e3649df0b292fa09075553b35c9082852f89c37003d8d983fe51f97f9bb52a3dca7c6c93be16525f4120eaaa766b921050a5f1386e0302004b00010064801ec6cc1ff28fcbfcdda951ee53e3649df0b292fa09075553b35c9082852f89c37000860168747470733a2f2f732e67657467656d732e696f2f6e66742f732f363238662f3632386661333932343334356261366565623337623038612f6d6574612e6a736f6e0114ff00f4a413f4bcf2c80b050201620b0602012008070023bc7e7f8011818b8646580e4bfb801682021c0201580a090011b40e9e0042046be070001db5dafe004d863a1a61fa61ff4806100202ce0f0c0201200e0d001b32140133c59633c5b333327b552000153b51343e903e9035350c20020120111000113e910c1c2ebcb8536004b90c8871c02497c0f83434c0c05c6c2497c0f83e903e900c7e800c5c75c87e800c7e800c3c0081b4c7f4cfe08417f30f45148c2ea3a1cc8411c40d90057820840bf2c9a8948c2eb8c0a0841a4f4e54148c2eb8c0a0840701104a948c2ea017161512015c8e8732104710364015e0313234353582101a0b9d5112ba9f5113c705f2e19a01d4d4301023f003e05f04840ff2f01301f65136c705f2e191fa4021f001fa40d20031fa00820afaf0801ba121945315a0a1de22d70b01c300209206a19136e220c2fff2e192218e3e8210511a4463c8500acf16500bcf1671244a145446b0708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb00105794102a385be2140082028e3526f0018210d53276db103745006d71708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb0093303334e25502f0030054165f063301d0128210a8cb00ad708010c8cb055005cf1624fa0214cb6a13cb1fcb3f01cf16c98040fb000086165f066c2270c8cb01c97082108b77173521c8cbff03d013cf16138040708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb0001f65137c705f2e191fa4021f001fa40d20031fa00820afaf0801ba121945315a0a1de22d70b01c300209206a19136e220c200f2e192218e3e821005138d91c8500bcf16500bcf1671244b145446c0708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb00106794102a395be2180082028e3526f0018210d53276db103746006d71708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb0093303434e25502f0035677cdb2&amount=100000000',
            );
          }}
        >
          nft-single-deploy
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-item-deploy.json?ownerAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&itemContentUri=0.json&nftCollectionAddress=EQB2LZVUlK3LfU1On-8g_iQWs8tWofBxQGzcKKYTs-QXJl1g&itemIndex=0&amount=100000000&forwardAmount=50000000&nftItemContentBaseUri=https%3A%2F%2Fs.getgems.io%2Fnft%2Fc%2F628f990a4345ba6eeb37b083%2F',
            );
          }}
        >
          nft-item-deploy
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-collection-deploy.json?ownerAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&royalty=0.1&royaltyAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&collectionContentUri=https%3A%2F%2Fs.getgems.io%2Fnft%2Fc%2F628f9800640fb688b8283a49%2Fmeta.json&nftItemContentBaseUri=https%3A%2F%2Fs.getgems.io%2Fnft%2Fc%2F628f9800640fb688b8283a49%2F&nftCollectionStateInitHex=b5ee9c72410227010004c50002013413010353801ec6cc1ff28fcbfcdda951ee53e3649df0b292fa09075553b35c9082852f89c3600000000000000010100302004b000a0064801ec6cc1ff28fcbfcdda951ee53e3649df0b292fa09075553b35c9082852f89c3700114ff00f4a413f4bcf2c80b0402016206050009a11f9fe0050202ce0a070201200908001d00f232cfd633c58073c5b3327b5520003b3b513434cffe900835d27080269fc07e90350c04090408f80c1c165b5b600201200c0b00113e910c1c2ebcb8536002d70c8871c02497c0f83434c0c05c6c2497c0f83e903e900c7e800c5c75c87e800c7e800c3c00812ce3850c1b088d148cb1c17cb865407e90350c0408fc00f801b4c7f4cfe08417f30f45148c2ea3a1cc840dd78c9004f80c0d0d0d4d60840bf2c9a884aeb8c097c12103fcbc200e0d00727082108b77173505c8cbff5004cf1610248040708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb0001f65135c705f2e191fa4021f001fa40d20031fa00820afaf0801ba121945315a0a1de22d70b01c300209206a19136e220c2fff2e192218e3e821005138d91c85009cf16500bcf16712449145446a0708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb00104794102a375be20f0082028e3526f0018210d53276db103744006d71708010c8cb055007cf165005fa0215cb6a12cb1fcb3f226eb39458cf17019132e201c901fb0093303234e25502f00302001211006868747470733a2f2f732e67657467656d732e696f2f6e66742f632f3632386639393061343334356261366565623337623038332f007c0168747470733a2f2f732e67657467656d732e696f2f6e66742f632f3632386639393061343334356261366565623337623038332f6d6574612e6a736f6e0114ff00f4a413f4bcf2c80b140201621c1502012017160025bc82df6a2687d20699fea6a6a182de86a182c40201201b180201201a19002db4f47da89a1f481a67fa9a9a86028be09e008e003e00b0002fb5dafda89a1f481a67fa9a9a860d883a1a61fa61ff4806100043b8b5d31ed44d0fa40d33fd4d4d43010245f04d0d431d430d071c8cb0701cf16ccc980202cd221d0201201f1e003d45af0047021f005778018c8cb0558cf165004fa0213cb6b12ccccc971fb0080201202120001b3e401d3232c084b281f2fff27420002d007232cffe0a33c5b25c083232c044fd003d0032c0326004e7d10638048adf000e8698180b8d848adf07d201800e98fe99ff6a2687d20699fea6a6a184108349e9ca829405d47141baf8280e8410854658056b84008646582a802e78b127d010a65b509e58fe59f80e78b64c0207d80701b28b9e382f970c892e000f18112e001718112e001f181181981e002426252423003c8e15d4d43010344130c85005cf1613cb3fccccccc9ed54e05f04840ff2f0002c323401fa40304144c85005cf1613cb3fccccccc9ed5400a6357003d4308e378040f4966fa5208e2906a4208100fabe93f2c18fde81019321a05325bbf2f402fa00d43022544b30f00623ba9302a402de04926c21e2b3e6303250444313c85005cf1613cb3fccccccc9ed5400603502d33f5313bbf2e1925313ba01fa00d43028103459f0068e1201a44343c85005cf1613cb3fccccccc9ed54925f05e24d391a89&amount=100000000&contractAddress=EQB2LZVUlK3LfU1On-8g_iQWs8tWofBxQGzcKKYTs-QXJl1g&nftItemCodeHex=b5ee9c72410227010004c50002013413010353801ec6cc1ff28fcbfcdd',
            );
          }}
        >
          nft-collection-deploy
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-sale-place-getgems.json?marketplaceFeeAddress=EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS&marketplaceFee=50000000&royaltyAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&royaltyAmount=10000000&createdAt=1653498738&marketplaceAddress=EQBYTuYbLf8INxFtD8tQeNk5ZLy-nAX9ahQbG_yl1qQ-GEMS&nftItemAddress=EQA0S3vSblu2GbZ0ODSIVgneKEDqvvEvrXF2aoslaObITPU9&ownerAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&fullPrice=1000000000&deployAmount=200000000&transferAmount=200000000&saleMessageBocHex=b5ee9c7241021101000314000288000000015de17c4aa8997cc1e4a953131818e5422f0e4368579abc4f9a0666c6f80470742f58c2fb0050765107562960443b4baa72a0e76942bf69102b9ab7b6d1f329070201000002013405030197314731b9400584ee61b2dff0837116d0fcb5078d93964bcbe9c05fd6a141b1bfca5d6a43e188006896f7a4dcb76c336ce8706910ac13bc5081d57de25f5ae2ecd5164ad1cd909821dcd650040400958014726b0c3ef3b5eb3427ada305c2c80421805f31c7be31fb4e971eb5628357e30805f5e101003d8d983fe51f97f9bb52a3dca7c6c93be16525f4120eaaa766b921050a5f1386ce625a020114ff00f4a413f4bcf2c80b0602012008070004f2300201480a090051a03859da89a1a601a63ff481f481f481f401a861a1f481f401f481f4006104208c92b0a0158002ab010202cd0d0b01f7660840ee6b280149828148c2fbcb87089343e903e803e903e800c14e4a848685421e845a814a41c20043232c15400f3c5807e80b2dab25c7ec00970800975d27080ac2385d4115c20043232c15400f3c5807e80b2dab25c7ec00408e48d0d38969c20043232c15400f3c5807e80b2dab25c7ec01c08208417f30f4520c0082218018c8cb052acf1621fa02cb6acb1f13cb3f23cf165003cf16ca0021fa02ca00c98306fb0071555006c8cb0015cb1f5003cf1601cf1601cf1601fa02ccc9ed5402f7d00e8698180b8d8492f82707d201876a2686980698ffd207d207d207d006a18136000f968ca116ba4e10159c720191c1c29a0e382c92f847028a26382f970fa02698fc1080289c6c8895d7970fae99f98fd2018202b036465800ae58fa801e78b00e78b00e78b00fd016664f6aa701b13e380718103e98fe99f9810c100e014ac001925f0be021c0029f31104910384760102510241023f005e03ac003e3025f09840ff2f00f00ca82103b9aca0018bef2e1c95346c7055152c70515b1f2e1ca702082105fcc3d14218010c8cb0528cf1621fa02cb6acb1f19cb3f27cf1627cf1618ca0027fa0217ca00c98040fb0071065044451506c8cb0015cb1f5003cf1601cf1601cf1601fa02ccc9ed540016371038476514433070f0059bcd46bb&marketplaceSignatureHex=5de17c4aa8997cc1e4a953131818e5422f0e4368579abc4f9a0666c6f80470742f58c2fb0050765107562960443b4baa72a0e76942bf69102b9ab7b6d1f32907&forwardAmount=200000000',
            );
          }}
        >
          nft-sale-place-getgems
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-transfer.json?newOwnerAddress=EQAn7UCXbrjmgAApFV5FzuVX4P2avn_S3O3BwFpxgi2yf_Cy&nftItemAddress=EQBWPunGskn1VravuYLccv1Hn4hnTThBmMl01KFaCKk9Vn3j&amount=100000000&forwardAmount=20000000&text=just%20message',
            );
          }}
        >
          nft-transfer
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-sale-cancel.json?nftItemAddress=EQBWPunGskn1VravuYLccv1Hn4hnTThBmMl01KFaCKk9Vn3j&saleAddress=EQDSvW4yebxQup3j9tdAfjwhdGuZDb1C8lfYV4z3O7mLFb7D&ownerAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&amount=1100000000',
            );
          }}
        >
          nft-sale-cancel
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-change-owner.json?newOwnerAddress=EQAn7UCXbrjmgAApFV5FzuVX4P2avn_S3O3BwFpxgi2yf_Cy&nftCollectionAddress=EQAiwgIKpPUggGpVkiJe_Wo0flouYiAuipM78qgTCutTm3-g&amount=100000000',
            );
          }}
        >
          nft-change-owner
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/nft-sale-place.json?marketplaceAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&nftItemAddress=EQCu-GX7Gq0Q5WXKKQWLpwOw3ccjSrhAo6l4sffZJLH94mGC&fullPrice=1000000000&marketplaceFee=100000000&royaltyAddress=EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n&royaltyAmount=100000000&amount=100000000',
            );
          }}
        >
          nft-sale-place
        </Button>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/v1/txrequest-url/txrequest.testtonlogin.xyz/api/deploy.json?address=EQD0QPfz2s0GRvxYn7mxaDq3Uqn29GgzkuDAC5KIM1tuZhny&stateInitHex=&amount=100000000',
            );
          }}
        >
          Deploy
        </Button>
        <DevSeparator />

        <DevSeparator />
        <DevSeparator />

        <Text variant="h2">Other</Text>
        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/transfer/EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n?amount=100000&text=test',
            );
          }}
        >
          Open transfer with amount
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/transfer/EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n?amount=100000000000000&text=test',
            );
          }}
        >
          Open transfer with huge amount
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/transfer/EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n?amount=2000000000000000&jetton=EQDlBqGI2r44jpnhYfEiJahU8b7Zoo3no13l6Q9H-AIJbAgo&text=test',
            );
          }}
        >
          Open transfer with santa tokens
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'ton://transfer/EQD2NmD_lH5f5u1Kj3KfGyTvhZSX0Eg6qp2a5IQUKXxOG21n?amount=100000&text=test',
              { params: { methodId: 'mercuryo_sell' } },
            );
          }}
        >
          Open transfer with amount (mercuryo)
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve('ton://transfer');
          }}
        >
          Open empty transfer and ton://
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/ton-login/getgems.io/tk?id=MmY-9t41lQkLCW98-m0ikw&page=%2F%3F',
            );
          }}
        >
          Ton Connect (getgems example)
        </Button>

        <DevSeparator />

        <Button
          onPress={() => {
            deeplinking.resolve(
              'https://app.tonkeeper.com/subscribe/626df87eb96d7f3a1c24f470',
              { delay: 1000 },
            );
          }}
        >
          Subscribe with delay 1s
        </Button>
        <DevSeparator />
        <Button
          onPress={() => {
            deeplinking.resolve('https://app.tonkeeper.com/buy-ton');
          }}
        >
          Buy TON
        </Button>
      </Screen.ScrollView>
    </Screen>
  );
};
