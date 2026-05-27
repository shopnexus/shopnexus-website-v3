import { test, expect, type Page } from "@playwright/test";
import { BUYER_STORAGE, TIMEOUTS } from "../fixtures/test-data";

/**
 * ====================================================================
 *  Scenario 5: Ban quản trị giải quyết Tranh chấp (Admin Dispute Resolution)
 * ====================================================================
 *
 *  Black-box E2E tests for Admin Dispute Resolution.
 *  Uses BUYER_STORAGE as base authenticated context and mocks GET /account/me
 *  to return role: "Admin" or role: "Member" dynamically.
 *  Uses page.route to mock API responses for deterministic testing.
 */

test.describe("Ban quản trị giải quyết Tranh chấp (Admin Dispute Resolution)", () => {
  // We can reuse the buyer authenticated context as a base session
  test.use({ storageState: BUYER_STORAGE });

  const MOCK_MEMBER_PROFILE = {
    id: "buyer-account-uuid",
    role: "Member",
    email: "truongtuantu@gmail.com",
    username: "buyer",
    status: "Active",
    country: "VN",
    currency: "VND",
  };

  const MOCK_ADMIN_PROFILE = {
    id: "admin-account-uuid",
    role: "Admin",
    email: "admin@shopnexus.test",
    username: "admin",
    status: "Active",
    country: "VN",
    currency: "VND",
  };

  const MOCK_DISPUTE_OPEN = {
    id: "dispute-open-123",
    refund_id: "refund-123",
    account_id: "seller-id", // seller
    reason: "The buyer returned a cheap counterfeit item instead of the original product.",
    attachments: [
      {
        name: "counterfeit.png",
        url: "https://shopnexus.hopto.org/uploads/counterfeit.png",
        kind: "image",
      },
    ],
    status: "Open",
    date_created: "2026-05-26T12:00:00Z",
    resolved_by_id: null,
    date_resolved: null,
    resolution_note: null,
  };

  const MOCK_DISPUTE_UPHELD = {
    ...MOCK_DISPUTE_OPEN,
    status: "SellerWins",
    resolved_by_id: "admin-account-uuid",
    date_resolved: "2026-05-27T09:00:00Z",
    resolution_note: "Seller's claim is correct. Serial numbers do not match.",
  };

  const MOCK_DISPUTE_DISMISSED = {
    ...MOCK_DISPUTE_OPEN,
    status: "BuyerWins",
    resolved_by_id: "admin-account-uuid",
    date_resolved: "2026-05-27T09:00:00Z",
    resolution_note: "Buyer evidence is valid. Refund approved.",
  };

  // ── Helper Mocks ──────────────────────────────────────────────────

  async function mockProfile(page: Page, profileData: any) {
    await page.route("**/api/v1/account/me", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: profileData }),
      });
    });
  }

  async function mockDisputeList(page: Page, disputes: any[]) {
    await page.route("**/api/v1/order/disputes*", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          data: disputes,
          pagination: {
            total: disputes.length,
            limit: 20,
          },
        }),
      });
    });
  }

  // ── Tests ────────────────────────────────────────────────────────

  test("REF-14: Kiểm tra màn hình yêu cầu quyền Admin hoạt động đúng (Access Control)", async ({ page }) => {
    // A. Member attempts to access admin disputes
    await mockProfile(page, MOCK_MEMBER_PROFILE);
    await page.goto("/admin/disputes");
    await page.waitForLoadState("domcontentloaded");

    // The access denied alert should be visible
    await expect(page.getByText(/admin access required/i)).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(page.getByText(/console is only available to platform staff/i)).toBeVisible();
    await expect(page.getByText("Admin · Refund Disputes")).toBeHidden();

    // B. Admin attempts to access admin disputes
    await mockProfile(page, MOCK_ADMIN_PROFILE);
    await mockDisputeList(page, []); // return empty list initially
    await page.goto("/admin/disputes");
    await page.waitForLoadState("domcontentloaded");

    // The console header should load successfully
    await expect(page.getByText("Admin · Refund Disputes")).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(page.getByText(/admin access required/i)).toBeHidden();
  });

  test("REF-15: Admin phán quyết có lợi cho Người bán thành công (Uphold Dispute)", async ({ page }) => {
    // 1. Setup mocks for admin and dispute list
    await mockProfile(page, MOCK_ADMIN_PROFILE);
    await mockDisputeList(page, [MOCK_DISPUTE_OPEN]);

    // Mock Uphold Dispute API
    let upholdApiCalled = false;
    await page.route(`**/api/v1/order/disputes/${MOCK_DISPUTE_OPEN.id}/uphold`, async (route) => {
      upholdApiCalled = true;
      expect(route.request().method()).toBe("POST");

      const body = JSON.parse(route.request().postData() || "{}");
      expect(body.resolution_note).toBe("Seller's claim is correct. Serial numbers do not match.");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_DISPUTE_UPHELD }),
      });
    });

    // 2. Go to admin disputes page
    await page.goto("/admin/disputes");
    await page.waitForLoadState("domcontentloaded");

    // "Seller wins (Uphold)" and "Buyer wins (Dismiss)" buttons should be visible
    const upholdBtn = page.getByRole("button", { name: /seller wins/i });
    const dismissBtn = page.getByRole("button", { name: /buyer wins/i });
    await expect(upholdBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await expect(dismissBtn).toBeVisible();

    // 3. Click "Seller wins (Uphold)"
    await upholdBtn.click();

    // Dialog opens
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /uphold dispute/i })).toBeVisible();

    // Fill resolution note
    const noteTextarea = dialog.locator("#resolution-note");
    await noteTextarea.fill("Seller's claim is correct. Serial numbers do not match.");

    // Click confirm inside dialog and wait for response
    const responsePromise = page.waitForResponse(`**/api/v1/order/disputes/${MOCK_DISPUTE_OPEN.id}/uphold`);
    
    // Mock the dispute list retrieval after resolve to return the Upheld state
    await mockDisputeList(page, [MOCK_DISPUTE_UPHELD]);

    await dialog.getByRole("button", { name: /confirm/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(upholdApiCalled).toBe(true);

    // Toast success "Dispute upheld." should be visible
    await expect(page.getByText(/dispute upheld/i).or(page.getByText(/items will be shipped back/i))).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });

    // Dialog closes
    await expect(dialog).toBeHidden();
  });

  test("REF-16: Admin phán quyết có lợi cho Người mua thành công (Dismiss Dispute)", async ({ page }) => {
    // 1. Setup mocks
    await mockProfile(page, MOCK_ADMIN_PROFILE);
    await mockDisputeList(page, [MOCK_DISPUTE_OPEN]);

    // Mock Dismiss Dispute API
    let dismissApiCalled = false;
    await page.route(`**/api/v1/order/disputes/${MOCK_DISPUTE_OPEN.id}/dismiss`, async (route) => {
      dismissApiCalled = true;
      expect(route.request().method()).toBe("POST");

      const body = JSON.parse(route.request().postData() || "{}");
      expect(body.resolution_note).toBe("Buyer evidence is valid. Refund approved.");

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ data: MOCK_DISPUTE_DISMISSED }),
      });
    });

    // 2. Go to admin disputes page
    await page.goto("/admin/disputes");
    await page.waitForLoadState("domcontentloaded");

    const dismissBtn = page.getByRole("button", { name: /buyer wins/i });
    await expect(dismissBtn).toBeVisible({ timeout: TIMEOUTS.DATA_LOAD });
    await dismissBtn.click();

    // Dialog opens
    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole("heading", { name: /dismiss dispute/i })).toBeVisible();

    // Fill resolution note
    const noteTextarea = dialog.locator("#resolution-note");
    await noteTextarea.fill("Buyer evidence is valid. Refund approved.");

    // Click confirm inside dialog and wait for response
    const responsePromise = page.waitForResponse(`**/api/v1/order/disputes/${MOCK_DISPUTE_OPEN.id}/dismiss`);
    
    // Mock the dispute list after resolve to return the Dismissed state
    await mockDisputeList(page, [MOCK_DISPUTE_DISMISSED]);

    await dialog.getByRole("button", { name: /confirm/i }).click();
    const response = await responsePromise;

    expect(response.status()).toBe(200);
    expect(dismissApiCalled).toBe(true);

    // Toast success "Dispute dismissed." should appear
    await expect(page.getByText(/dispute dismissed/i).or(page.getByText(/buyer wallet credited/i))).toBeVisible({
      timeout: TIMEOUTS.TOAST,
    });

    // Dialog closes
    await expect(dialog).toBeHidden();
  });

  test("REF-17: Kiểm tra bắt lỗi validation trong popup phán quyết (Trống Resolution Note)", async ({ page }) => {
    // 1. Setup mocks
    await mockProfile(page, MOCK_ADMIN_PROFILE);
    await mockDisputeList(page, [MOCK_DISPUTE_OPEN]);

    // 2. Go to admin disputes page
    await page.goto("/admin/disputes");
    await page.waitForLoadState("domcontentloaded");

    // Click Seller wins (Uphold) to trigger resolution dialog
    await page.getByRole("button", { name: /seller wins/i }).click();

    const dialog = page.locator("[role='dialog']");
    await expect(dialog).toBeVisible();

    const noteTextarea = dialog.locator("#resolution-note");
    const confirmBtn = dialog.getByRole("button", { name: /confirm/i });

    // Resolution note is empty initially -> Confirm must be disabled
    await expect(confirmBtn).toBeDisabled();

    // Type space characters -> Confirm should remain disabled
    await noteTextarea.fill("   ");
    await expect(confirmBtn).toBeDisabled();

    // Fill a valid note -> Confirm should be enabled
    await noteTextarea.fill("This is a valid resolution note.");
    await expect(confirmBtn).toBeEnabled();

    // Close Dialog
    await dialog.getByRole("button", { name: /cancel/i }).click();
    await expect(dialog).toBeHidden();
  });
});
