import { describe, expect, it } from "vitest";

describe("Pricing Calculation", () => {
  function calculatePricing(totalPrice: number) {
    const insuranceFee = totalPrice * 0.15;
    const systemCommission = 100;
    const driverPayout = totalPrice - insuranceFee - systemCommission;
    
    return {
      totalPrice,
      insuranceFee,
      systemCommission,
      driverPayout,
    };
  }

  it("should calculate correct pricing for 1000 EUR order", () => {
    const result = calculatePricing(1000);
    
    expect(result.totalPrice).toBe(1000);
    expect(result.insuranceFee).toBe(150); // 15%
    expect(result.systemCommission).toBe(100);
    expect(result.driverPayout).toBe(750);
  });

  it("should calculate correct pricing for 500 EUR order", () => {
    const result = calculatePricing(500);
    
    expect(result.totalPrice).toBe(500);
    expect(result.insuranceFee).toBe(75); // 15%
    expect(result.systemCommission).toBe(100);
    expect(result.driverPayout).toBe(325);
  });

  it("should calculate correct pricing for 2000 EUR order", () => {
    const result = calculatePricing(2000);
    
    expect(result.totalPrice).toBe(2000);
    expect(result.insuranceFee).toBe(300); // 15%
    expect(result.systemCommission).toBe(100);
    expect(result.driverPayout).toBe(1600);
  });

  it("insurance fee should always be 15% of total price", () => {
    const testPrices = [100, 250, 500, 750, 1000, 1500, 2000, 5000];
    
    testPrices.forEach(price => {
      const result = calculatePricing(price);
      expect(result.insuranceFee).toBe(price * 0.15);
    });
  });

  it("total should equal insurance + commission + driver payout", () => {
    const testPrices = [100, 500, 1000, 2000, 5000];
    
    testPrices.forEach(price => {
      const result = calculatePricing(price);
      const sum = result.insuranceFee + result.systemCommission + result.driverPayout;
      expect(sum).toBeCloseTo(result.totalPrice, 2);
    });
  });

  it("should handle decimal prices correctly", () => {
    const result = calculatePricing(1234.56);
    
    expect(result.totalPrice).toBe(1234.56);
    expect(result.insuranceFee).toBeCloseTo(185.18, 2); // 15%
    expect(result.systemCommission).toBe(100);
    expect(result.driverPayout).toBeCloseTo(949.38, 2);
  });
});
