package com.brainhive;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
public class PingController {

    @GetMapping("/ping")
    public Map<String, String> ping() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "pong");
        response.put("status", "Backend is running!");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        return response;
    }

    @GetMapping("/")
    public String home() {
        return "BrainHive Backend is running!";
    }
}