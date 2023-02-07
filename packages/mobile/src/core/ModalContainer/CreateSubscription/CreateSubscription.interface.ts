import { SubscriptionModel } from '$store/models';

export interface CreateSubscriptionProps {
  invoiceId?: string;
  isEdit?: boolean;
  subscription?: SubscriptionModel;
  fee?: string;
}
