import { SignRawParams } from '$core/ModalContainer/NFTOperations/TXRequest.types';

export const isSignRawParams = (value: any): value is SignRawParams =>
  Boolean(value?.valid_until) && value?.messages?.length > 0;
