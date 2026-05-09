package com.assettrack.config;

import com.assettrack.domain.asset.Asset;
import com.assettrack.domain.asset.AssetStatus;
import com.assettrack.domain.asset.AssetType;
import com.assettrack.domain.asset.AssetAllocation;
import com.assettrack.domain.asset.ConditionReport;
import com.assettrack.domain.asset.ConditionSeverity;
import com.assettrack.domain.asset.ConditionReportStatus;
import com.assettrack.domain.notification.Notification;
import com.assettrack.domain.notification.NotificationType;
import com.assettrack.domain.user.User;
import com.assettrack.domain.user.Role;
import com.assettrack.repository.asset.AssetRepository;
import com.assettrack.repository.asset.AssetAllocationRepository;
import com.assettrack.repository.asset.ConditionReportRepository;
import com.assettrack.repository.notification.NotificationRepository;
import com.assettrack.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;



/**
 * Seeds the PostgreSQL database with realistic sample data on application startup.
 * Only runs when the "dev" or "seed" profile is active to prevent accidental seeding in production.
 *
 * Activate with: spring.profiles.active=dev
 *
 * Seeded data overview:
 *   Users       — 1 ADMIN, 2 MANAGERs, 5 DEVELOPERs
 *   Assets      — 15 assets covering all types and statuses
 *   Allocations — 6 active + 3 historical (returned)
 *   Condition Reports — 5 reports covering all severities/statuses
 *   Notifications     — sample notifications for each type
 */
@Slf4j
@Component
@RequiredArgsConstructor
@Profile({"dev", "seed"})
public class DatabaseSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final AssetRepository assetRepository;
    private final AssetAllocationRepository allocationRepository;
    private final ConditionReportRepository conditionReportRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("[Seeder] Database already contains data — skipping seed.");
            return;
        }

        log.info("[Seeder] Starting database seed...");

        List<User> users = seedUsers();
        List<Asset> assets = seedAssets();
        List<AssetAllocation> allocations = seedAllocations(assets, users);
        seedConditionReports(assets, users);
        seedNotifications(assets, users);

        log.info("[Seeder] Seed complete. Users={}, Assets={}, Allocations={}",
                userRepository.count(), assetRepository.count(), allocationRepository.count());
    }

    // ─────────────────────────────────────────────
    // USERS
    // ─────────────────────────────────────────────

    private List<User> seedUsers() {
        log.info("[Seeder] Seeding users...");

        // ADMIN
        User admin = User.builder()
                .firstName("Alice")
                .lastName("Admin")
                .email("alice.admin@company.com")
                .passwordHash(passwordEncoder.encode("Admin@1234"))
                .role(Role.ADMIN)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(12))
                .build();

        // MANAGERs
        User manager1 = User.builder()
                .firstName("Bob")
                .lastName("Manager")
                .email("bob.manager@company.com")
                .passwordHash(passwordEncoder.encode("Manager@1234"))
                .role(Role.MANAGER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(10))
                .build();

        User manager2 = User.builder()
                .firstName("Carol")
                .lastName("Ops")
                .email("carol.ops@company.com")
                .passwordHash(passwordEncoder.encode("Manager@1234"))
                .role(Role.MANAGER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(8))
                .build();

        // DEVELOPERs
        User dev1 = User.builder()
                .firstName("Dave")
                .lastName("Developer")
                .email("dave.dev@company.com")
                .passwordHash(passwordEncoder.encode("Dev@12345"))
                .role(Role.DEVELOPER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(6))
                .build();

        User dev2 = User.builder()
                .firstName("Eve")
                .lastName("Engineer")
                .email("eve.eng@company.com")
                .passwordHash(passwordEncoder.encode("Dev@12345"))
                .role(Role.DEVELOPER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(5))
                .build();

        User dev3 = User.builder()
                .firstName("Frank")
                .lastName("Frontend")
                .email("frank.fe@company.com")
                .passwordHash(passwordEncoder.encode("Dev@12345"))
                .role(Role.DEVELOPER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(4))
                .build();

        User dev4 = User.builder()
                .firstName("Grace")
                .lastName("Backend")
                .email("grace.be@company.com")
                .passwordHash(passwordEncoder.encode("Dev@12345"))
                .role(Role.DEVELOPER)
                .isActive(true)
                .createdAt(LocalDateTime.now().minusMonths(3))
                .build();

        // Inactive user (deactivated account)
        User inactiveUser = User.builder()
                .firstName("Henry")
                .lastName("Former")
                .email("henry.former@company.com")
                .passwordHash(passwordEncoder.encode("Dev@12345"))
                .role(Role.DEVELOPER)
                .isActive(false)
                .createdAt(LocalDateTime.now().minusMonths(14))
                .updatedAt(LocalDateTime.now().minusMonths(1))
                .build();

        List<User> users = userRepository.saveAll(
                List.of(admin, manager1, manager2, dev1, dev2, dev3, dev4, inactiveUser));
        log.info("[Seeder] {} users saved.", users.size());
        return users;
    }

    // ─────────────────────────────────────────────
    // ASSETS
    // ─────────────────────────────────────────────

    private List<Asset> seedAssets() {
        log.info("[Seeder] Seeding assets...");

        // ── Laptops ──────────────────────────────
        Asset laptop1 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("XPS 15 9530")
                .serialNumber("DL-XPS15-001")
                .purchaseDate(LocalDate.of(2024, 1, 10))
                .warrantyExpirationDate(LocalDate.of(2027, 1, 10))
                .status(AssetStatus.ALLOCATED)
                .notes("Purchased for new-hire batch Q1 2024")
                .createdAt(LocalDateTime.of(2024, 1, 15, 9, 0))
                .build();

        Asset laptop2 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Apple")
                .model("MacBook Pro 14 M3")
                .serialNumber("AP-MBP14-002")
                .purchaseDate(LocalDate.of(2024, 3, 5))
                .warrantyExpirationDate(LocalDate.of(2027, 3, 5))
                .status(AssetStatus.ALLOCATED)
                .notes("Engineering team allocation")
                .createdAt(LocalDateTime.of(2024, 3, 10, 10, 0))
                .build();

        Asset laptop3 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Lenovo")
                .model("ThinkPad X1 Carbon Gen 12")
                .serialNumber("LV-X1C-003")
                .purchaseDate(LocalDate.of(2023, 6, 20))
                .warrantyExpirationDate(LocalDate.of(2026, 6, 20))
                .status(AssetStatus.AVAILABLE)
                .notes("Spare laptop for hot-desking")
                .createdAt(LocalDateTime.of(2023, 6, 25, 8, 30))
                .build();

        Asset laptop4 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("HP")
                .model("EliteBook 840 G10")
                .serialNumber("HP-EB840-004")
                .purchaseDate(LocalDate.of(2022, 9, 15))
                .warrantyExpirationDate(LocalDate.now().minusMonths(2)) // already expired
                .status(AssetStatus.UNDER_REPAIR)
                .notes("Sent for screen repair; warranty already lapsed")
                .createdAt(LocalDateTime.of(2022, 9, 20, 9, 0))
                .build();

        Asset laptop5 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Dell")
                .model("Latitude 5540")
                .serialNumber("DL-LAT55-005")
                .purchaseDate(LocalDate.of(2021, 4, 1))
                .warrantyExpirationDate(LocalDate.of(2024, 4, 1))
                .status(AssetStatus.DECOMMISSIONED)
                .notes("End-of-life — replaced by XPS 15 batch")
                .createdAt(LocalDateTime.of(2021, 4, 5, 11, 0))
                .build();

        Asset laptop6 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Apple")
                .model("MacBook Pro 16 M3 Pro")
                .serialNumber("AP-MBP16-006")
                .purchaseDate(LocalDate.of(2024, 5, 1))
                .warrantyExpirationDate(LocalDate.now().plusDays(20)) // expiring soon
                .status(AssetStatus.SPARE)
                .notes("Designated spare pool — expiring warranty alert due")
                .createdAt(LocalDateTime.of(2024, 5, 5, 9, 0))
                .build();

        // ── Monitors ─────────────────────────────
        Asset monitor1 = Asset.builder()
                .type(AssetType.MONITOR)
                .brand("LG")
                .model("UltraWide 34WP85C-B")
                .serialNumber("LG-UW34-007")
                .purchaseDate(LocalDate.of(2024, 2, 1))
                .warrantyExpirationDate(LocalDate.of(2027, 2, 1))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2024, 2, 5, 10, 0))
                .build();

        Asset monitor2 = Asset.builder()
                .type(AssetType.MONITOR)
                .brand("Dell")
                .model("UltraSharp U2723DE")
                .serialNumber("DL-U2723-008")
                .purchaseDate(LocalDate.of(2023, 11, 10))
                .warrantyExpirationDate(LocalDate.of(2026, 11, 10))
                .status(AssetStatus.AVAILABLE)
                .createdAt(LocalDateTime.of(2023, 11, 15, 9, 0))
                .build();

        // ── Keyboards ────────────────────────────
        Asset keyboard1 = Asset.builder()
                .type(AssetType.KEYBOARD)
                .brand("Logitech")
                .model("MX Keys S")
                .serialNumber("LG-MXKEYS-009")
                .purchaseDate(LocalDate.of(2024, 1, 20))
                .warrantyExpirationDate(LocalDate.of(2026, 1, 20))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2024, 1, 22, 10, 0))
                .build();

        // ── Mice ─────────────────────────────────
        Asset mouse1 = Asset.builder()
                .type(AssetType.MOUSE)
                .brand("Logitech")
                .model("MX Master 3S")
                .serialNumber("LG-MXM3S-010")
                .purchaseDate(LocalDate.of(2024, 1, 20))
                .warrantyExpirationDate(LocalDate.of(2026, 1, 20))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2024, 1, 22, 10, 0))
                .build();

        // ── Headsets ─────────────────────────────
        Asset headset1 = Asset.builder()
                .type(AssetType.HEADSET)
                .brand("Sony")
                .model("WH-1000XM5")
                .serialNumber("SN-WH1000-011")
                .purchaseDate(LocalDate.of(2023, 8, 1))
                .warrantyExpirationDate(LocalDate.of(2025, 8, 1))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2023, 8, 5, 9, 0))
                .build();

        // ── Docking Stations ─────────────────────
        Asset dock1 = Asset.builder()
                .type(AssetType.DOCKING_STATION)
                .brand("CalDigit")
                .model("TS4 Thunderbolt 4 Dock")
                .serialNumber("CD-TS4-012")
                .purchaseDate(LocalDate.of(2024, 2, 1))
                .warrantyExpirationDate(LocalDate.of(2027, 2, 1))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2024, 2, 5, 10, 0))
                .build();

        // ── Other ─────────────────────────────────
        Asset webcam1 = Asset.builder()
                .type(AssetType.OTHER)
                .brand("Logitech")
                .model("Brio 4K Webcam")
                .serialNumber("LG-BRIO4K-013")
                .purchaseDate(LocalDate.of(2023, 10, 1))
                .warrantyExpirationDate(LocalDate.of(2026, 10, 1))
                .status(AssetStatus.AVAILABLE)
                .notes("Conference room webcam")
                .createdAt(LocalDateTime.of(2023, 10, 5, 9, 0))
                .build();

        Asset laptop7 = Asset.builder()
                .type(AssetType.LAPTOP)
                .brand("Lenovo")
                .model("ThinkPad T14 Gen 4")
                .serialNumber("LV-T14G4-014")
                .purchaseDate(LocalDate.of(2024, 4, 10))
                .warrantyExpirationDate(LocalDate.of(2027, 4, 10))
                .status(AssetStatus.ALLOCATED)
                .notes("Allocated to backend engineer")
                .createdAt(LocalDateTime.of(2024, 4, 15, 10, 0))
                .build();

        Asset monitor3 = Asset.builder()
                .type(AssetType.MONITOR)
                .brand("Samsung")
                .model("Odyssey G7 32\"")
                .serialNumber("SM-ODG732-015")
                .purchaseDate(LocalDate.of(2024, 3, 1))
                .warrantyExpirationDate(LocalDate.of(2027, 3, 1))
                .status(AssetStatus.ALLOCATED)
                .createdAt(LocalDateTime.of(2024, 3, 5, 9, 0))
                .build();

        List<Asset> assets = assetRepository.saveAll(List.of(
                laptop1, laptop2, laptop3, laptop4, laptop5, laptop6,
                monitor1, monitor2, keyboard1, mouse1, headset1, dock1,
                webcam1, laptop7, monitor3
        ));
        log.info("[Seeder] {} assets saved.", assets.size());
        return assets;
    }

    // ─────────────────────────────────────────────
    // ALLOCATIONS
    // ─────────────────────────────────────────────

    private List<AssetAllocation> seedAllocations(List<Asset> assets, List<User> users) {
        log.info("[Seeder] Seeding allocations...");

        // Convenience lookups by serial number / email
        Asset laptop1   = findAsset(assets, "DL-XPS15-001");
        Asset laptop2   = findAsset(assets, "AP-MBP14-002");
        Asset laptop7   = findAsset(assets, "LV-T14G4-014");
        Asset monitor1  = findAsset(assets, "LG-UW34-007");
        Asset monitor3  = findAsset(assets, "SM-ODG732-015");
        Asset keyboard1 = findAsset(assets, "LG-MXKEYS-009");
        Asset mouse1    = findAsset(assets, "LG-MXM3S-010");
        Asset headset1  = findAsset(assets, "SN-WH1000-011");
        Asset dock1     = findAsset(assets, "CD-TS4-012");

        User dev1  = findUser(users, "dave.dev@company.com");
        User dev2  = findUser(users, "eve.eng@company.com");
        User dev3  = findUser(users, "frank.fe@company.com");
        User dev4  = findUser(users, "grace.be@company.com");
        User mgr1  = findUser(users, "bob.manager@company.com");

        // ── Active allocations ────────────────────
        AssetAllocation alloc1 = AssetAllocation.builder()
                .asset(laptop1)
                .user(dev1)
                .checkoutDate(LocalDateTime.of(2024, 2, 1, 9, 0))
                .notes("Primary laptop for Dave")
                .build();

        AssetAllocation alloc2 = AssetAllocation.builder()
                .asset(laptop2)
                .user(dev2)
                .checkoutDate(LocalDateTime.of(2024, 3, 15, 9, 0))
                .notes("Primary laptop for Eve")
                .build();

        AssetAllocation alloc3 = AssetAllocation.builder()
                .asset(laptop7)
                .user(dev4)
                .checkoutDate(LocalDateTime.of(2024, 4, 20, 9, 0))
                .notes("Primary laptop for Grace")
                .build();

        AssetAllocation alloc4 = AssetAllocation.builder()
                .asset(monitor1)
                .user(dev1)
                .checkoutDate(LocalDateTime.of(2024, 2, 1, 9, 0))
                .notes("Paired with DL-XPS15-001")
                .build();

        AssetAllocation alloc5 = AssetAllocation.builder()
                .asset(monitor3)
                .user(dev2)
                .checkoutDate(LocalDateTime.of(2024, 3, 15, 9, 0))
                .notes("Paired with AP-MBP14-002")
                .build();

        AssetAllocation alloc6 = AssetAllocation.builder()
                .asset(dock1)
                .user(dev2)
                .checkoutDate(LocalDateTime.of(2024, 3, 15, 9, 0))
                .notes("CalDigit dock for Eve's desk")
                .build();

        AssetAllocation alloc7 = AssetAllocation.builder()
                .asset(keyboard1)
                .user(dev3)
                .checkoutDate(LocalDateTime.of(2024, 2, 5, 10, 0))
                .notes("Keyboard for Frank")
                .build();

        AssetAllocation alloc8 = AssetAllocation.builder()
                .asset(mouse1)
                .user(dev3)
                .checkoutDate(LocalDateTime.of(2024, 2, 5, 10, 0))
                .notes("Mouse for Frank")
                .build();

        AssetAllocation alloc9 = AssetAllocation.builder()
                .asset(headset1)
                .user(mgr1)
                .checkoutDate(LocalDateTime.of(2023, 9, 1, 9, 0))
                .notes("For remote meetings")
                .build();

        // ── Historical (returned) allocations ─────
        Asset laptop3 = findAsset(assets, "LV-X1C-003");

        AssetAllocation historical1 = AssetAllocation.builder()
                .asset(laptop3)
                .user(dev1)
                .checkoutDate(LocalDateTime.of(2023, 7, 1, 9, 0))
                .returnDate(LocalDateTime.of(2024, 1, 31, 17, 0))
                .notes("Returned when XPS 15 batch arrived")
                .build();

        AssetAllocation historical2 = AssetAllocation.builder()
                .asset(laptop3)
                .user(dev3)
                .checkoutDate(LocalDateTime.of(2022, 6, 1, 9, 0))
                .returnDate(LocalDateTime.of(2023, 6, 30, 17, 0))
                .notes("Returned — user transferred team")
                .build();

        AssetAllocation historical3 = AssetAllocation.builder()
                .asset(findAsset(assets, "DL-LAT55-005"))
                .user(findUser(users, "henry.former@company.com"))
                .checkoutDate(LocalDateTime.of(2021, 5, 1, 9, 0))
                .returnDate(LocalDateTime.of(2024, 3, 15, 17, 0))
                .notes("Returned on employee offboarding; asset decommissioned")
                .build();

        List<AssetAllocation> allocations = allocationRepository.saveAll(List.of(
                alloc1, alloc2, alloc3, alloc4, alloc5, alloc6,
                alloc7, alloc8, alloc9,
                historical1, historical2, historical3
        ));
        log.info("[Seeder] {} allocations saved.", allocations.size());
        return allocations;
    }

    // ─────────────────────────────────────────────
    // CONDITION REPORTS
    // ─────────────────────────────────────────────

    private void seedConditionReports(List<Asset> assets, List<User> users) {
        log.info("[Seeder] Seeding condition reports...");

        User dev1 = findUser(users, "dave.dev@company.com");
        User dev2 = findUser(users, "eve.eng@company.com");
        User mgr1 = findUser(users, "bob.manager@company.com");

        Asset laptop1 = findAsset(assets, "DL-XPS15-001");
        Asset laptop4 = findAsset(assets, "HP-EB840-004");
        Asset laptop2 = findAsset(assets, "AP-MBP14-002");
        Asset headset1 = findAsset(assets, "SN-WH1000-011");
        Asset monitor1 = findAsset(assets, "LG-UW34-007");

        // OPEN — critical issue
        ConditionReport report1 = ConditionReport.builder()
                .asset(laptop1)
                .reportedBy(dev1)
                .issueDescription("Battery drains within 2 hours under normal workload. " +
                        "Running browser + IDE causes rapid discharge even when plugged in intermittently.")
                .severity(ConditionSeverity.CRITICAL)
                .status(ConditionReportStatus.OPEN)
                .reportDate(LocalDateTime.now().minusDays(3))
                .updatedAt(LocalDateTime.now().minusDays(3))
                .build();

        // IN_PROGRESS — high severity
        ConditionReport report2 = ConditionReport.builder()
                .asset(laptop4)
                .reportedBy(mgr1)
                .issueDescription("Screen has a 3cm vertical line artifact on the right side. " +
                        "Visible on all applications; affects code readability.")
                .severity(ConditionSeverity.HIGH)
                .status(ConditionReportStatus.IN_PROGRESS)
                .reportDate(LocalDateTime.now().minusDays(14))
                .updatedAt(LocalDateTime.now().minusDays(5))
                .resolutionNotes("Laptop sent to HP authorised service centre. Awaiting parts.")
                .build();

        // RESOLVED
        ConditionReport report3 = ConditionReport.builder()
                .asset(laptop2)
                .reportedBy(dev2)
                .issueDescription("Left USB-C port does not charge the laptop. " +
                        "Right port works fine. Charging cable confirmed OK on another device.")
                .severity(ConditionSeverity.MEDIUM)
                .status(ConditionReportStatus.RESOLVED)
                .reportDate(LocalDateTime.now().minusDays(30))
                .updatedAt(LocalDateTime.now().minusDays(10))
                .resolutionNotes("Apple Genius Bar replaced the USB-C port. Laptop back in service.")
                .build();

        // CLOSED — low severity cosmetic
        ConditionReport report4 = ConditionReport.builder()
                .asset(headset1)
                .reportedBy(mgr1)
                .issueDescription("Left ear pad shows slight peeling on the outer edge. " +
                        "Audio quality unaffected; purely cosmetic.")
                .severity(ConditionSeverity.LOW)
                .status(ConditionReportStatus.CLOSED)
                .reportDate(LocalDateTime.now().minusDays(60))
                .updatedAt(LocalDateTime.now().minusDays(55))
                .resolutionNotes("Replacement ear pads ordered and fitted. Issue closed.")
                .build();

        // OPEN — medium severity
        ConditionReport report5 = ConditionReport.builder()
                .asset(monitor1)
                .reportedBy(dev1)
                .issueDescription("Monitor intermittently loses signal and goes black for 2–5 seconds. " +
                        "Happens 3–4 times per day, more frequent after extended use.")
                .severity(ConditionSeverity.MEDIUM)
                .status(ConditionReportStatus.OPEN)
                .reportDate(LocalDateTime.now().minusDays(7))
                .updatedAt(LocalDateTime.now().minusDays(7))
                .build();

        conditionReportRepository.saveAll(
                List.of(report1, report2, report3, report4, report5));
        log.info("[Seeder] 5 condition reports saved.");
    }

    // ─────────────────────────────────────────────
    // NOTIFICATIONS
    // ─────────────────────────────────────────────

    private void seedNotifications(List<Asset> assets, List<User> users) {
        log.info("[Seeder] Seeding notifications...");

        User admin = findUser(users, "alice.admin@company.com");
        User mgr1  = findUser(users, "bob.manager@company.com");
        User dev1  = findUser(users, "dave.dev@company.com");
        User dev2  = findUser(users, "eve.eng@company.com");

        Asset laptop6  = findAsset(assets, "AP-MBP16-006");  // expiring soon
        Asset laptop1  = findAsset(assets, "DL-XPS15-001");
        Asset laptop2  = findAsset(assets, "AP-MBP14-002");
        Asset monitor2 = findAsset(assets, "DL-U2723-008");

        // WARRANTY_EXPIRY — admin & manager alert
        Notification n1 = Notification.builder()
                .type(NotificationType.WARRANTY_EXPIRY)
                .recipient(admin.getEmail())
                .messageBody("Warranty for Apple MacBook Pro 16 M3 Pro (AP-MBP16-006) expires in 20 days.")
                .assetId(laptop6.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        Notification n2 = Notification.builder()
                .type(NotificationType.WARRANTY_EXPIRY)
                .recipient(mgr1.getEmail())
                .messageBody("Warranty for Apple MacBook Pro 16 M3 Pro (AP-MBP16-006) expires in 20 days.")
                .assetId(laptop6.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now().minusDays(1))
                .build();

        // ASSET_ALLOCATED — developer notified
        Notification n3 = Notification.builder()
                .type(NotificationType.ASSET_ALLOCATED)
                .recipient(dev1.getEmail())
                .messageBody("Dell XPS 15 9530 (DL-XPS15-001) has been allocated to you.")
                .assetId(laptop1.getId())
                .isRead(true)
                .createdAt(LocalDateTime.of(2024, 2, 1, 9, 5))
                .build();

        Notification n4 = Notification.builder()
                .type(NotificationType.ASSET_ALLOCATED)
                .recipient(dev2.getEmail())
                .messageBody("Apple MacBook Pro 14 M3 (AP-MBP14-002) has been allocated to you.")
                .assetId(laptop2.getId())
                .isRead(true)
                .createdAt(LocalDateTime.of(2024, 3, 15, 9, 5))
                .build();

        // ASSET_RETURNED
        Notification n5 = Notification.builder()
                .type(NotificationType.ASSET_RETURNED)
                .recipient(mgr1.getEmail())
                .messageBody("Lenovo ThinkPad X1 Carbon Gen 12 (LV-X1C-003) has been returned by Dave Developer.")
                .assetId(findAsset(assets, "LV-X1C-003").getId())
                .isRead(true)
                .createdAt(LocalDateTime.of(2024, 1, 31, 17, 10))
                .build();

        // CONDITION_REPORT_OPENED
        Notification n6 = Notification.builder()
                .type(NotificationType.CONDITION_REPORT_OPENED)
                .recipient(mgr1.getEmail())
                .messageBody("CRITICAL condition report opened for Dell XPS 15 9530 (DL-XPS15-001): " +
                        "Battery drains within 2 hours under normal workload.")
                .assetId(laptop1.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        Notification n7 = Notification.builder()
                .type(NotificationType.CONDITION_REPORT_OPENED)
                .recipient(admin.getEmail())
                .messageBody("CRITICAL condition report opened for Dell XPS 15 9530 (DL-XPS15-001).")
                .assetId(laptop1.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now().minusDays(3))
                .build();

        // CONDITION_REPORT_RESOLVED
        Notification n8 = Notification.builder()
                .type(NotificationType.CONDITION_REPORT_RESOLVED)
                .recipient(dev2.getEmail())
                .messageBody("Your condition report for Apple MacBook Pro 14 M3 (AP-MBP14-002) " +
                        "has been resolved: USB-C port replaced.")
                .assetId(laptop2.getId())
                .isRead(true)
                .createdAt(LocalDateTime.now().minusDays(10))
                .build();

        // LOW_STOCK — monitors running low
        Notification n9 = Notification.builder()
                .type(NotificationType.LOW_STOCK)
                .recipient(admin.getEmail())
                .messageBody("Low stock alert: only 1 MONITOR is currently AVAILABLE (threshold: 2).")
                .assetId(monitor2.getId())
                .isRead(false)
                .createdAt(LocalDateTime.now().minusHours(6))
                .build();

        notificationRepository.saveAll(
                List.of(n1, n2, n3, n4, n5, n6, n7, n8, n9));
        log.info("[Seeder] 9 notifications saved.");
    }

    // ─────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────

    private Asset findAsset(List<Asset> assets, String serialNumber) {
        return assets.stream()
                .filter(a -> a.getSerialNumber().equals(serialNumber))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Seeder: Asset not found for serial number: " + serialNumber));
    }

    private User findUser(List<User> users, String email) {
        return users.stream()
                .filter(u -> u.getEmail().equals(email))
                .findFirst()
                .orElseThrow(() -> new IllegalStateException(
                        "Seeder: User not found for email: " + email));
    }
}