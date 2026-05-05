export type WalletChoice = 'burner' | 'metamask';

export interface Review {
  id?: string;
  code_snippet?: string;
  language?: string;
  submitter?: string;
  overall_score: number;
  summary: string;
  bugs_found: string[];
  suggestions: string[];
  security_issues: string[];
  // Internal — never rendered.
  _rawEqOutput?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  _rawTx?: any;
  _eqOutputPath?: string;
  _txHash?: string;
}

export interface ProgressFn {
  (msg: string, txHash?: string): void;
}
