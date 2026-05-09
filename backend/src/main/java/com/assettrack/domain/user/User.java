package com.assettrack.domain.user;

import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.ConditionReport;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * User entity representing an application account.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    /** User identifier. */
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    /** Unique email address used for authentication. */
    @Column(nullable = false, unique = true)
    private String email;

    /** BCrypt password hash. */
    @Column(nullable = false)
    private String passwordHash;

    /** Given name. */
    @Column(name = "first_name")
    private String firstName;

    /** Family name. */
    @Column(name = "last_name")
    private String lastName;

    /** Assigned application role. */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    /** Whether the account is active. */
    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    /** Full allocation history for the user. */
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @OrderBy("checkoutDate DESC")
    @Builder.Default
    private List<AssetAllocation> allocations = new ArrayList<>();

    /** Condition reports submitted by the user. */
    @OneToMany(mappedBy = "reportedBy", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ConditionReport> conditionReports = new ArrayList<>();

    /** UTC creation timestamp. */
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** UTC last update timestamp. */
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}