package com.assettrack.repository.notification;

import com.assettrack.domain.notification.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, java.util.UUID> {

    Page<Notification> findByRecipient(String recipient, Pageable pageable);

    Optional<Notification> findByIdAndRecipient(java.util.UUID id, String recipient);
}
