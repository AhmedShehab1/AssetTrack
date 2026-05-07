package com.assettrack.common.exception;

import com.assettrack.exception.EmailAlreadyExistsException;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DummyController {
    @PostMapping("/test/validation")
    public void testEndpoint(@Valid @RequestBody DummyRequest request) {
    }

    @GetMapping("/test/base-exception")
    public void throwBaseException() {
        throw new EmailAlreadyExistsException("Email already in use");
    }
}
