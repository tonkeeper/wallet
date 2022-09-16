import { Address } from "tonweb/dist/types/utils/address";
import TonWeb, { ContractOptions } from "tonweb"
import BN from "bn.js";

const { Cell } = TonWeb.boc;
const { Contract } = TonWeb;

// Fix tonweb typo 
type WriteAddressMethod = (address?: Address | null) => void;
export interface GetGemsSaleContractOpetions extends ContractOptions {
  marketplaceFeeAddress: Address;
  marketplaceAddress: Address;
  royaltyAddress: Address;
  nftItemAddress: Address;
  marketplaceFee: BN;
  royaltyAmount: BN;
  fullPrice: BN;
  createdAt: number;  
}

export class GetGemsSaleContract extends Contract<GetGemsSaleContractOpetions> {
  constructor(provider, options: any) {
    options.wc = 0;

    const NftFixPriceSaleV2CodeBoc = 'te6cckECDAEAAikAART/APSkE/S88sgLAQIBIAMCAATyMAIBSAUEAFGgOFnaiaGmAaY/9IH0gfSB9AGoYaH0gfQB9IH0AGEEIIySsKAVgAKrAQICzQgGAfdmCEDuaygBSYKBSML7y4cIk0PpA+gD6QPoAMFOSoSGhUIehFqBSkHCAEMjLBVADzxYB+gLLaslx+wAlwgAl10nCArCOF1BFcIAQyMsFUAPPFgH6AstqyXH7ABAjkjQ04lpwgBDIywVQA88WAfoCy2rJcfsAcCCCEF/MPRSBwCCIYAYyMsFKs8WIfoCy2rLHxPLPyPPFlADzxbKACH6AsoAyYMG+wBxVVAGyMsAFcsfUAPPFgHPFgHPFgH6AszJ7VQC99AOhpgYC42EkvgnB9IBh2omhpgGmP/SB9IH0gfQBqGBNgAPloyhFrpOEBWccgGRwcKaDjgskvhHAoomOC+XD6AmmPwQgCicbIiV15cPrpn5j9IBggKwNkZYAK5Y+oAeeLAOeLAOeLAP0BZmT2qnAbE+OAcYED6Y/pn5gQwLCQFKwAGSXwvgIcACnzEQSRA4R2AQJRAkECPwBeA6wAPjAl8JhA/y8AoAyoIQO5rKABi+8uHJU0bHBVFSxwUVsfLhynAgghBfzD0UIYAQyMsFKM8WIfoCy2rLHxnLPyfPFifPFhjKACf6AhfKAMmAQPsAcQZQREUVBsjLABXLH1ADzxYBzxYBzxYB+gLMye1UABY3EDhHZRRDMHDwBTThaBI='
    const NftFixPriceSaleV2CodeCell = Cell.oneFromBoc(TonWeb.utils.base64ToBytes(NftFixPriceSaleV2CodeBoc));

    options.code = NftFixPriceSaleV2CodeCell;

    super(provider, options);
  }

  protected createDataCell() {
    let feesCell = new Cell();
    
    feesCell.bits.writeAddress(this.options.marketplaceFeeAddress);
    feesCell.bits.writeCoins(this.options.marketplaceFee);
    feesCell.bits.writeAddress(this.options.royaltyAddress);
    feesCell.bits.writeCoins(this.options.royaltyAmount);

    let dataCell = new Cell();

    dataCell.bits.writeUint(0, 1); // isComplete
    dataCell.bits.writeUint(this.options.createdAt, 32);
    dataCell.bits.writeAddress(this.options.marketplaceAddress);
    dataCell.bits.writeAddress(this.options.nftItemAddress);
    (dataCell.bits.writeAddress as WriteAddressMethod)(null); // nftOwnerAddress
    dataCell.bits.writeCoins(this.options.fullPrice);
    dataCell.refs.push(feesCell);

    return dataCell
  }
}