import { getPnL } from './pnl.service';
import { getBalanceSheet } from './balance-sheet.service';
import { getCashFlow } from './cashflow.service';

export const FinancialsService = {
    getPnL,
    getBalanceSheet,
    getCashFlow,
};
