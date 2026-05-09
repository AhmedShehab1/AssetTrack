package com.assettrack.domain.user;

/**
 * Application roles that control access to backend operations.
 */
public enum Role {

    ADMIN("Admin"),
    MANAGER("Manager"),
    DEVELOPER("Developer");

    private final String displayName;

    Role(String displayName) {
        this.displayName = displayName;
    }

    public String getDisplayName() {
        return displayName;
    }
}