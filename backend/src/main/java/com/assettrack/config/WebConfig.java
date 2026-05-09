package com.assettrack.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web MVC configuration for request-level validation and interceptors.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(new HandlerInterceptor() {
            @Override
            public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
                    throws Exception {
                String pageParam = request.getParameter("page");
                if (pageParam != null) {
                    try {
                        int page = Integer.parseInt(pageParam);
                        if (page > 1000) {
                            response.sendError(400, "Page number cannot exceed 1000");
                            return false;
                        }
                    } catch (NumberFormatException e) {
                        // ignore, handled by Spring
                    }
                }
                return true;
            }
        });
    }
}
