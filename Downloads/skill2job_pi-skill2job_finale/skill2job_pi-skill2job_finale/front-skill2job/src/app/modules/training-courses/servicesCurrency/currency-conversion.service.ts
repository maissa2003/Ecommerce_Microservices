import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CurrencyConversionService {
  private exchangeRates: any = {
    USD: 1,
    EUR: 0.92,
    TND: 3.12
  };

  convert(amount: number, from: string, to: string): number {
    if (!amount || from === to) return amount;

    const usd = amount / this.exchangeRates[from];
    const converted = usd * this.exchangeRates[to];

    return Math.round(converted * 100) / 100;
  }
}
