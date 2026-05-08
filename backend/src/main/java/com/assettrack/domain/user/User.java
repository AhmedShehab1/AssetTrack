package com.assettrack.domain.user;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.ConditionReport;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    @Builder.Default
    private boolean isActive = true;

    // One user → many allocations (their full history)
    @OneToMany(mappedBy = "user", fetch = FetchType.LAZY)
    @OrderBy("checkoutDate DESC")
    @Builder.Default
    private List<AssetAllocation> allocations = new ArrayList<>();

    // One user → many reports they filed
    @OneToMany(mappedBy = "reportedBy", fetch = FetchType.LAZY)
    @Builder.Default
    private List<ConditionReport> conditionReports = new ArrayList<>();

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

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