

describe("LoginPage", () => {
  beforeEach(() => {
    cy.visit("/login"); // adjust if your route is different
  });

  describe('Display', () => {
    it("renders login form by default", () => {
      cy.contains("Login").should("have.class", "border-b-2");
      cy.get("[data-testid='login-email'").should("exist");
      cy.get("[data-testid='login-password'").should("exist");
    })

    it("shows forgot password form and handles submit", () => {
      cy.contains("Forgot password?").click();
      cy.contains("Reset Password").should("exist");
      cy.get("input[type=email]").type("forgot@example.com");
      cy.contains("Send Reset Instructions").click();
      cy.on("window:alert", (txt) => {
        expect(txt).to.contains("password reset instructions would be sent");
      });
    });
  })

  describe("Signup", () => {
    it("switches to signup tab", () => {
      cy.contains("Sign Up").click();
      cy.get("[data-testid='signup-username'").should("exist");
      cy.get("[data-testid='signup-email'").should("exist");
      cy.get("[data-testid='signup-password'").should("exist");
      cy.get("[data-testid='signup-confirm-password'").should("exist");
    });

    it("signup password validation error", () => {
      cy.contains("Sign Up").click();
      cy.get("[data-testid='signup-password'").type("test");
      cy.contains("Password requirements").should("exist");
      cy.contains("At least 8 characters").should("exist");
    });

    it("signup password mismatch", () => {
      cy.contains("Sign Up").click();
      cy.get("[data-testid='signup-password'").type("StrongPass1!");
      cy.get("[data-testid='signup-confirm-password'").type("MismatchPass1!");
      cy.contains("Passwords do not match").should("exist");
    });

    it("signup password requirements are met", () => {
      cy.contains("Sign Up").click();
      cy.get("[data-testid='signup-password'").type("StrongPass1!");
      cy.contains("Password meets all requirements").should("exist");
    });

    it("handles signup failure - exisitng user", () => {
      cy.intercept("POST", "/auth/signup", {
        statusCode: 400,
        body: { message: "Email aready exists" },
      }).as("signupRequest");


      cy.contains("Sign Up").click();
      cy.get("[data-testid='signup-username'").type("testUser1");
      cy.get("[data-testid='signup-email'").type("testuser1@gmail.com");
      cy.get("[data-testid='signup-password'").type("StrongPass1!");
      cy.get("[data-testid='signup-confirm-password'").type("StrongPass1!");
      cy.get("[data-testid='signup-button'").click();

      cy.wait("@signupRequest");
      // cy.wait("@autoLoginRequest");
      cy.contains("Email aready exists").should("exist");
    });

  })


  describe("Login", () => {
    it("shows error for empty login fields", () => {
      cy.get("[data-testid='login-button'").click();
      cy.contains("All fields are required").should("exist");
    });

    it("handles login failure - incorrect email ", () => {
      cy.intercept("POST", "/auth/login", {
        statusCode: 401,
        body: { message: "Invalid email or password" },
      }).as("loginRequest");

      cy.get("[data-testid='login-email'").type("testuser1@gmail.co");
      cy.get("[data-testid='login-password'").type("testUser@301");
      cy.get("[data-testid='login-button'").click();

      cy.wait("@loginRequest");
      cy.contains("Invalid email or password").should("exist");
    });

    it("handles login failure - incorrect password ", () => {
      cy.intercept("POST", "/auth/login", {
        statusCode: 401,
        body: { message: "Invalid email or password" },
      }).as("loginRequest");

      cy.get("[data-testid='login-email'").type("testuser1@gmail.com");
      cy.get("[data-testid='login-password'").type("testUser@30");
      cy.get("[data-testid='login-button'").click();

      cy.wait("@loginRequest");
      cy.contains("Invalid email or password").should("exist");
    });

    it("handles login failure - incorrect email and password ", () => {
      cy.intercept("POST", "/auth/login", {
        statusCode: 401,
        body: { message: "Invalid email or password" },
      }).as("loginRequest");

      cy.get("[data-testid='login-email'").type("testuser1@gmail.com");
      cy.get("[data-testid='login-password'").type("testUser@30");
      cy.get("[data-testid='login-button'").click();

      cy.wait("@loginRequest");
      cy.contains("Invalid email or password").should("exist");
    });

    it("handles login success", () => {
      cy.intercept("POST", "/auth/login", {
        statusCode: 200,
        body: { message: "Login successful" },
      }).as("loginRequest");

      cy.get("[data-testid='login-email'").type("testuser1@gmail.com");
      cy.get("[data-testid='login-password'").type("testUser@301");
      cy.get("[data-testid='login-button'").click();

      cy.wait("@loginRequest");
      cy.url().should("include", "/home");
    });
  })

});
function generateRandomUser() {
  const id = Math.floor(Math.random() * 100000);
  return {
    username: `testuser${id}`,
    email: `testuser${id}@example.com`,
    password: `StrongPass1!`,
  };
}
