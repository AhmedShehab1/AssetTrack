package com.assettrack.repository.notification;

import com.assettrack.domain.notification.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, java.util.UUID> {

    List<Notification> findByRecipientOrderByCreatedAtDesc(String recipient);

    Optional<Notification> findByIdAndRecipient(java.util.UUID id, String recipient);
}
