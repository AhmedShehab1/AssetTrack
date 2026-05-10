package com.assettrack.repository.notification;

import com.assettrack.domain.notification.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, java.util.UUID> {

    Page<Notification> findByRecipient(String recipient, Pageable pageable);

    Optional<Notification> findByIdAndRecipient(java.util.UUID id, String recipient);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.recipient = :recipient")
    void markAllAsReadByRecipient(@Param("recipient") String recipient);
}
