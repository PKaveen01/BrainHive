/*package com.brainhive.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class SessionFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String path = request.getRequestURI();

        // Skip session check for public endpoints
        if (path.startsWith("/api/auth/login") ||
                path.startsWith("/api/auth/register") ||
                path.startsWith("/api/auth/subjects")) {
            filterChain.doFilter(request, response);
            return;
        }

        // For protected endpoints, check session
        if (path.startsWith("/api/auth/complete-profile") ||
                path.startsWith("/api/dashboard")) {

            HttpSession session = request.getSession(false);
            System.out.println("Session check for " + path + ": " + (session != null ? "Session exists with ID: " + session.getId() : "No session"));

            if (session != null && session.getAttribute("userId") != null) {
                System.out.println("User ID in session: " + session.getAttribute("userId"));
                filterChain.doFilter(request, response);
                return;
            } else {
                System.out.println("No valid session found for " + path);
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                response.setContentType("application/json");
                response.getWriter().write("{\"success\": false, \"message\": \"Please login first\"}");
                return;
            }
        }

        filterChain.doFilter(request, response);
    }
}


 */