package vn.edu.crs.auth_service.dto;

public class LoginResponseDTO {

    private Long userId;
    private String token;
    private String username;
    private String role;

    public LoginResponseDTO() {
    }

    public LoginResponseDTO(Long userId, String token, String username, String role) {
        this.userId = userId;
        this.token = token;
        this.username = username;
        this.role = role;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}
