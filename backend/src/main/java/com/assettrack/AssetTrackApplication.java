package com.assettrack;

import com.assettrack.security.config.RsaKeyProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(RsaKeyProperties.class)
public class AssetTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(AssetTrackApplication.class, args);
    }

}
