package com.assettrack.common.exception;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DummyController {
    @PostMapping("/test/validation")
    public void testEndpoint(@Valid @RequestBody DummyRequest request) {
    }
}
