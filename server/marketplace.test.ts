import { describe, it, expect, beforeAll } from "vitest";
import * as marketplace from "./marketplace";

describe("Marketplace Service", () => {
  let orderId: number;

  it("should create a marketplace order", async () => {
    const result = await marketplace.createMarketplaceOrder(
      1, // clientId
      "BMW 3er",
      "Berlin",
      "Munich",
      new Date(),
      1000
    );
    expect(result.success).toBe(true);
    orderId = result.orderId;
  });

  it("should submit an offer", async () => {
    const result = await marketplace.submitOffer(orderId, 2, 950);
    expect(result.success).toBe(true);
  });

  it("should get offers", async () => {
    const offers = await marketplace.getOffers(orderId);
    expect(offers.length).toBeGreaterThan(0);
  });

  it("should accept an offer", async () => {
    const offers = await marketplace.getOffers(orderId);
    if (offers.length > 0) {
      const result = await marketplace.acceptOffer(offers[0].marketplace_offers.id, orderId);
      expect(result.success).toBe(true);
    }
  });
});
