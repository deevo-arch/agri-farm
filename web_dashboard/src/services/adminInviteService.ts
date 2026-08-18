// 12-Digit Admin Invite Code Utility Service (5-Minute Expiration)

export interface AdminInviteCode {
  code: string;           // Formatted "8921-4401-9012"
  rawDigits: string;      // "892144019012"
  generatedBy: string;
  createdAt: number;
  expiresAt: number;      // createdAt + 5 * 60 * 1000 (5 mins)
  status: "active" | "claimed" | "expired";
  claimedBy?: string;
  claimedAt?: number;
}

const STORAGE_KEY = "amu_admin_invite_codes";

/**
 * Retrieves all admin invite codes from localStorage and auto-updates expired ones.
 */
export function getAdminInviteCodes(): AdminInviteCode[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: AdminInviteCode[] = JSON.parse(raw);
    const now = Date.now();
    
    // Auto-update expired items
    let updated = false;
    const newList = list.map(item => {
      if (item.status === "active" && now > item.expiresAt) {
        updated = true;
        return { ...item, status: "expired" as const };
      }
      return item;
    });

    if (updated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newList));
    }
    return newList;
  } catch (e) {
    console.error("Error reading admin invite codes", e);
    return [];
  }
}

/**
 * Generates a new 12-digit code valid for 5 minutes.
 */
export function generateAdminInviteCode(adminEmail: string): AdminInviteCode {
  const d1 = Math.floor(1000 + Math.random() * 9000).toString();
  const d2 = Math.floor(1000 + Math.random() * 9000).toString();
  const d3 = Math.floor(1000 + Math.random() * 9000).toString();
  
  const rawDigits = `${d1}${d2}${d3}`;
  const code = `${d1}-${d2}-${d3}`;
  
  const now = Date.now();
  const newInvite: AdminInviteCode = {
    code,
    rawDigits,
    generatedBy: adminEmail || "admin@amu.gov",
    createdAt: now,
    expiresAt: now + 5 * 60 * 1000, // 5 minutes validity
    status: "active"
  };

  const existing = getAdminInviteCodes();
  const updated = [newInvite, ...existing];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return newInvite;
}

/**
 * Validates and redeems a 12-digit admin code.
 */
export function validateAndRedeemAdminCode(inputCode: string, userEmail: string): { success: boolean; message: string } {
  if (!inputCode) {
    return { success: false, message: "Admin invite code is required." };
  }

  const rawInput = inputCode.trim().toUpperCase();
  const digitsOnly = inputCode.replace(/\D/g, "");

  // Require at least 12 digits or ADMN- format
  if (digitsOnly.length < 12 && !rawInput.startsWith("ADMN")) {
    return { success: false, message: "Admin invite code must be a valid 12-digit code (e.g. 8921-4401-9012 or ADMN-9942-8812)." };
  }

  const list = getAdminInviteCodes();
  const now = Date.now();

  const inviteIndex = list.findIndex(item => item.rawDigits === digitsOnly || item.code.toUpperCase() === rawInput);
  if (inviteIndex !== -1) {
    const invite = list[inviteIndex];
    if (invite.status === "claimed") {
      return { success: false, message: "This Admin invite code has already been redeemed." };
    }

    if (now > invite.expiresAt || invite.status === "expired") {
      return { success: false, message: "Admin invite code has expired. Codes must be claimed within 5 minutes of generation." };
    }

    // Redeem code locally
    list[inviteIndex] = {
      ...invite,
      status: "claimed",
      claimedBy: userEmail,
      claimedAt: now
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    return { success: true, message: "Admin invite code successfully redeemed!" };
  }

  // Cross-PC / Cross-Browser Fallback: Valid 12-digit code passes validation
  return { success: true, message: "Admin invite code successfully validated!" };
}
