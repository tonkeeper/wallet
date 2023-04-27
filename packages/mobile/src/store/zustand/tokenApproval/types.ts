export enum TokenApprovalStatus {
  Approved = 'approved',
  Declined = 'declined',
}

export enum TokenApprovalType {
  Collection = 'collection',
  Jetton = 'jetton',
}

export interface ApprovalStatus {
  current: TokenApprovalStatus;
  type: TokenApprovalType;
  updated_at: number;
  approved_meta_revision: number;
}

export interface ITokenApprovalStore {
  tokens: Record<string, ApprovalStatus>;
  actions: {
    updateTokenStatus: (
      address: string,
      status: TokenApprovalStatus,
      type: TokenApprovalType,
    ) => void;
    removeTokenStatus: (address: string) => void;
  };
}
