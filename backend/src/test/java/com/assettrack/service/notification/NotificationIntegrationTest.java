package com.assettrack.service.notification;

import com.assettrack.domain.notification.Notification;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.mail.javamail.JavaMailSender;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
    "spring.datasource.driverClassName=org.h2.Driver",
    "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect"
})
public class NotificationIntegrationTest {

    @MockBean
    private JavaMailSender javaMailSender;

    @Autowired
    private EmailNotificationService emailNotificationService;

    @Autowired
    private AlertService alertService;

    @Test
    void contextLoadsAndServicesAvailable() {
        assertNotNull(emailNotificationService);
        assertNotNull(alertService);
        
        Notification notification = Notification.builder()
                .recipient("test@test.com")
                .messageBody("Test body")
                .type("Alert")
                .build();
        assertNotNull(notification.getCreatedAt());
    }
}
