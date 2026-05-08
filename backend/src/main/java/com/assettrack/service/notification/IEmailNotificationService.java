package com.assettrack.service.notification;

public interface IEmailNotificationService {
    void sendEmail(String to, String subject, String text, boolean isHtml);
}