describe("Complete AmarenLogist Workflow", () => {
  const baseUrl = "http://localhost:3000";
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = "TestPassword123!";

  describe("1. User Registration", () => {
    it("should register a new client user", () => {
      cy.visit(`${baseUrl}/register`);

      // Fill registration form
      cy.get('input[name="firstName"]').type("Max");
      cy.get('input[name="lastName"]').type("Mustermann");
      cy.get('input[name="email"]').type(testEmail);
      cy.get('input[name="password"]').type(testPassword);
      cy.get('input[name="phone"]').type("+49123456789");
      cy.get('select[name="role"]').select("client");

      // Submit
      cy.get('button[type="submit"]').click();

      // Verify success
      cy.contains("Registrierung erfolgreich").should("be.visible");
      cy.url().should("include", "/onboarding");
    });
  });

  describe("2. Document Verification", () => {
    it("should upload business documents", () => {
      cy.visit(`${baseUrl}/onboarding`);

      // Upload business registration
      cy.get('input[name="businessRegistration"]').selectFile("cypress/fixtures/sample-doc.pdf");
      cy.contains("Hochgeladen").should("be.visible");

      // Upload ID document
      cy.get('input[name="idDocument"]').selectFile("cypress/fixtures/sample-id.pdf");

      // Upload tax number
      cy.get('input[name="taxNumber"]').type("12345678901");

      // Submit
      cy.get('button:contains("Zur Prüfung einreichen")').click();

      // Verify status
      cy.contains("In Prüfung").should("be.visible");
    });
  });

  describe("3. Admin Verification", () => {
    it("should verify user as admin", () => {
      cy.login("zetologist", "zetologist123");
      cy.visit(`${baseUrl}/admin/verifications`);

      // Find pending verification
      cy.contains(testEmail).should("be.visible");

      // Click verify button
      cy.get(`[data-testid="verify-${testEmail}"]`).click();

      // Confirm verification
      cy.get('button:contains("Bestätigen")').click();

      // Verify status changed
      cy.contains("Verifiziert").should("be.visible");
    });
  });

  describe("4. Create Order", () => {
    it("should create a vehicle transport order", () => {
      cy.login(testEmail, testPassword);
      cy.visit(`${baseUrl}/orders/create`);

      // Fill order form
      cy.get('select[name="vehicleType"]').select("PKW");
      cy.get('input[name="pickupLocation"]').type("Berlin");
      cy.get('input[name="destination"]').type("Munich");
      cy.get('input[name="pickupDate"]').type("2024-02-15");
      cy.get('textarea[name="notes"]').type("Careful handling");

      // Verify price calculation
      cy.contains("€").should("be.visible");
      cy.contains("15%").should("be.visible"); // Insurance

      // Submit
      cy.get('button:contains("Auftrag erstellen")').click();

      // Verify order created
      cy.contains("Auftrag erfolgreich erstellt").should("be.visible");
      cy.url().should("include", "/orders/");
    });
  });

  describe("5. Driver Assignment", () => {
    it("should assign driver to order", () => {
      cy.login("amarenlogist", "amarenlogist555");
      cy.visit(`${baseUrl}/admin/orders`);

      // Find order
      cy.get('[data-testid="order-list"]').should("contain", "Berlin");

      // Click assign driver
      cy.get('[data-testid="assign-driver"]').first().click();

      // Select driver
      cy.get('select[name="driver"]').select("1");

      // Confirm
      cy.get('button:contains("Zuweisen")').click();

      // Verify assignment
      cy.contains("Fahrer zugewiesen").should("be.visible");
    });
  });

  describe("6. Payment Processing", () => {
    it("should process payment", () => {
      cy.login(testEmail, testPassword);
      cy.visit(`${baseUrl}/orders`);

      // Find order
      cy.get('[data-testid="order-item"]').first().click();

      // Click pay button
      cy.get('button:contains("Bezahlen")').click();

      // Fill payment form
      cy.get('input[name="cardNumber"]').type("4242424242424242");
      cy.get('input[name="expiry"]').type("12/25");
      cy.get('input[name="cvc"]').type("123");

      // Submit payment
      cy.get('button:contains("Zahlung abschließen")').click();

      // Verify payment success
      cy.contains("Zahlung erfolgreich").should("be.visible");
      cy.contains("Bezahlt").should("be.visible");
    });
  });

  describe("7. Order Status Updates", () => {
    it("should update order status", () => {
      cy.login("driver@example.com", testPassword);
      cy.visit(`${baseUrl}/driver/orders`);

      // Find assigned order
      cy.get('[data-testid="order-item"]').first().click();

      // Update status to "Unterwegs"
      cy.get('button:contains("Fahrt starten")').click();
      cy.contains("Unterwegs").should("be.visible");

      // Update status to "Abgeschlossen"
      cy.get('button:contains("Fahrt beendet")').click();
      cy.contains("Abgeschlossen").should("be.visible");
    });
  });

  describe("8. Rating & Feedback", () => {
    it("should rate driver after completion", () => {
      cy.login(testEmail, testPassword);
      cy.visit(`${baseUrl}/orders`);

      // Find completed order
      cy.get('[data-testid="completed-order"]').first().click();

      // Rate driver
      cy.get('[data-testid="rating-5"]').click();
      cy.get('textarea[name="feedback"]').type("Excellent service!");

      // Submit rating
      cy.get('button:contains("Bewertung abgeben")').click();

      // Verify rating submitted
      cy.contains("Vielen Dank für Ihre Bewertung").should("be.visible");
    });
  });

  describe("9. Invoice Generation", () => {
    it("should generate invoice after order completion", () => {
      cy.login(testEmail, testPassword);
      cy.visit(`${baseUrl}/invoices`);

      // Find invoice
      cy.get('[data-testid="invoice-item"]').first().should("contain", "INV-");

      // Download invoice
      cy.get('[data-testid="download-invoice"]').first().click();

      // Verify PDF download
      cy.readFile("cypress/downloads/invoice.pdf").should("exist");
    });
  });

  describe("10. SMS Notifications", () => {
    it("should send SMS notifications", () => {
      // This test verifies SMS logs in the database
      cy.visit(`${baseUrl}/admin/notifications`);

      // Filter SMS notifications
      cy.get('select[name="type"]').select("sms");

      // Verify SMS sent
      cy.contains("SMS versendet").should("be.visible");
      cy.get('[data-testid="sms-log"]').should("contain", "+49");
    });
  });

  describe("11. Compliance & Archiving", () => {
    it("should show compliance status", () => {
      cy.login("amarenlogist", "amarenlogist555");
      cy.visit(`${baseUrl}/admin/compliance`);

      // Verify compliance info
      cy.contains("DSGVO-konform").should("be.visible");
      cy.contains("7-Jahres-Aufbewahrung").should("be.visible");
      cy.contains("Audit-Trail").should("be.visible");
    });
  });
});

// Helper commands
Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("http://localhost:3000/login");
  cy.get('input[name="email"]').type(email);
  cy.get('input[name="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should("not.include", "/login");
});
