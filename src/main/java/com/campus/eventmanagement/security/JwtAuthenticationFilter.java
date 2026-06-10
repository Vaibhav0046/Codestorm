package com.campus.eventmanagement.security;

import java.io.IOException;
import java.util.Collections;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import com.campus.eventmanagement.util.JwtTokenProvider;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final com.campus.eventmanagement.repository.UserRepository userRepository;

    public JwtAuthenticationFilter(JwtTokenProvider tokenProvider, com.campus.eventmanagement.repository.UserRepository userRepository) {
        this.tokenProvider = tokenProvider;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = getJwtFromRequest(request);

        if (token != null) {
            String email = null;
            String role = null;

            if (tokenProvider.validateToken(token)) {
                email = tokenProvider.getEmailFromToken(token);
                role = tokenProvider.getRoleFromToken(token);
            } else {
                try {
                    if (!com.google.firebase.FirebaseApp.getApps().isEmpty()) {
                        com.google.firebase.auth.FirebaseToken decodedToken = com.google.firebase.auth.FirebaseAuth.getInstance().verifyIdToken(token);
                        email = decodedToken.getEmail();
                        role = "ROLE_USER";
                        if (email != null) {
                            java.util.Optional<com.campus.eventmanagement.entity.User> userOpt = userRepository.findByEmail(email);
                            if (userOpt.isPresent()) {
                                role = userOpt.get().getRole().name();
                            }
                        }
                    }
                } catch (Exception e) {
                    // Suppress and continue without setting context (authentication fails)
                }
            }

            if (email != null && role != null) {
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        email, null, Collections.singletonList(new SimpleGrantedAuthority(role)));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }
}
