package com.assettrack.service.notification;

/**
 * Contract for sending notification emails.
 */
public interface IEmailNotificationService {
    void sendEmail(String to, String subject, String text, boolean isHtml);
}