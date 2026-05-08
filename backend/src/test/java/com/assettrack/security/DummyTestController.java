package com.assettrack.security;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DummyTestController {

    @GetMapping("/auth/test")
    public String publicEndpoint() { return "Public OK"; }
    
    @GetMapping("/assets/test")
    public String protectedEndpoint() { return "Protected OK"; }
    
    @GetMapping("/users/test")
    public String adminEndpoint() { return "Admin OK"; }
}