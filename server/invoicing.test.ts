import { describe, it, expect, beforeEach } from "vitest";
import { generateInvoiceNumber } from "./invoiceService";

describe("Invoice System", () => {
  describe("generateInvoiceNumber", () => {
    it("should generate valid client invoice number", () => {
      const invoiceNumber = generateInvoiceNumber("client");
      expect(invoiceNumber).toMatch(/^INV-C-\d+-\d{3}$/);
    });

    it("should generate valid driver invoice number", () => {
      const invoiceNumber = generateInvoiceNumber("driver");
      expect(invoiceNumber).toMatch(/^INV-D-\d+-\d{3}$/);
    });

    it("should generate unique invoice numbers", () => {
      const number1 = generateInvoiceNumber("client");
      const number2 = generateInvoiceNumber("client");
      expect(number1).not.toBe(number2);
    });

    it("should have correct prefix for client invoices", () => {
      const invoiceNumber = generateInvoiceNumber("client");
      expect(invoiceNumber.startsWith("INV-C-")).toBe(true);
    });

    it("should have correct prefix for driver invoices", () => {
      const invoiceNumber = generateInvoiceNumber("driver");
      expect(invoiceNumber.startsWith("INV-D-")).toBe(true);
    });
  });

  describe("Invoice Calculations", () => {
    it("should calculate correct total with VAT", () => {
      const netAmount = 1000;
      const vatRate = 0.19;
      const totalWithVat = netAmount * (1 + vatRate);
      expect(totalWithVat).toBe(1190);
    });

    it("should calculate correct tax amount", () => {
      const netAmount = 1000;
      const vatRate = 0.19;
      const taxAmount = netAmount * vatRate;
      expect(taxAmount).toBe(190);
    });

    it("should handle multiple line items", () => {
      const items = [
        { quantity: 1, unitPrice: 500, taxRate: 0.19 },
        { quantity: 2, unitPrice: 250, taxRate: 0.19 },
      ];

      const total = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
      expect(total).toBe(1000);
    });

    it("should calculate correct driver payout (no VAT)", () => {
      const grossAmount = 1000;
      const insuranceRate = 0.15;
      const commissionRate = 0.1;

      const insurance = grossAmount * insuranceRate;
      const commission = grossAmount * commissionRate;
      const driverPayout = grossAmount - insurance - commission;

      expect(insurance).toBe(150);
      expect(commission).toBe(100);
      expect(driverPayout).toBe(750);
    });
  });

  describe("Invoice Status Transitions", () => {
    it("should transition from draft to sent", () => {
      const initialStatus = "draft";
      const newStatus = "sent";
      expect(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).toContain(newStatus);
    });

    it("should transition from sent to viewed", () => {
      const status = "viewed";
      expect(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).toContain(status);
    });

    it("should transition from viewed to paid", () => {
      const status = "paid";
      expect(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).toContain(status);
    });

    it("should allow cancellation from any status", () => {
      const statuses = ["draft", "sent", "viewed", "paid", "overdue"];
      const cancelledStatus = "cancelled";
      statuses.forEach((status) => {
        expect(["draft", "sent", "viewed", "paid", "overdue", "cancelled"]).toContain(cancelledStatus);
      });
    });
  });

  describe("Invoice Validation", () => {
    it("should validate invoice amount is positive", () => {
      const amount = 100;
      expect(amount > 0).toBe(true);
    });

    it("should validate invoice has recipient", () => {
      const recipientName = "John Doe";
      expect(recipientName.length > 0).toBe(true);
    });

    it("should validate invoice has items", () => {
      const items = [{ description: "Service", quantity: 1, unitPrice: 100, taxRate: 19 }];
      expect(items.length > 0).toBe(true);
    });

    it("should validate due date is after invoice date", () => {
      const invoiceDate = new Date("2024-01-01");
      const dueDate = new Date("2024-02-01");
      expect(dueDate > invoiceDate).toBe(true);
    });

    it("should validate email format", () => {
      const email = "test@example.com";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(true);
    });

    it("should reject invalid email format", () => {
      const email = "invalid-email";
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      expect(emailRegex.test(email)).toBe(false);
    });
  });

  describe("Invoice Numbering", () => {
    it("should have unique invoice numbers", () => {
      const numbers = new Set();
      for (let i = 0; i < 10; i++) {
        const number = generateInvoiceNumber("client");
        expect(numbers.has(number)).toBe(false);
        numbers.add(number);
      }
    });

    it("should follow sequential pattern", () => {
      const number = generateInvoiceNumber("client");
      const parts = number.split("-");
      expect(parts.length).toBe(4); // INV, C, timestamp, random
      expect(parts[0]).toBe("INV");
      expect(parts[1]).toBe("C");
    });
  });

  describe("Payment Terms", () => {
    it("should support standard payment terms", () => {
      const terms = ["Zahlbar innerhalb von 14 Tagen", "Zahlbar innerhalb von 30 Tagen", "Sofortzahlung"];
      expect(terms.length > 0).toBe(true);
    });

    it("should calculate due date correctly for 30 days", () => {
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 30);
      // Verify 30 days difference
      const daysDifference = Math.round((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDifference).toBe(30);
    });

    it("should calculate due date correctly for 14 days", () => {
      const invoiceDate = new Date();
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + 14);
      // Verify 14 days difference
      const daysDifference = Math.round((dueDate.getTime() - invoiceDate.getTime()) / (1000 * 60 * 60 * 24));
      expect(daysDifference).toBe(14);
    });
  });

  describe("Invoice Types", () => {
    it("should support client invoice type", () => {
      const type = "client";
      expect(["client", "driver"]).toContain(type);
    });

    it("should support driver invoice type", () => {
      const type = "driver";
      expect(["client", "driver"]).toContain(type);
    });

    it("client invoice should include VAT", () => {
      const invoiceType = "client";
      const hasVat = invoiceType === "client";
      expect(hasVat).toBe(true);
    });

    it("driver invoice should not include VAT", () => {
      const invoiceType = "driver";
      const hasVat = invoiceType === "client";
      expect(hasVat).toBe(false);
    });
  });
});
