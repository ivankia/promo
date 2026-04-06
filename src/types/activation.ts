export interface Activation {
  id: string;
  promocodeId: string;
  email: string;
  activatedAt: Date;
}

export type ActivationResponse = Activation;

export interface ActivationInput {
  promocode: string;
  email: string;
}
