package vn.edu.crs.auth_service.service;

import vn.edu.crs.auth_service.dto.ApiKeyCreateRequestDTO;
import vn.edu.crs.auth_service.dto.ApiKeyResponseDTO;
import vn.edu.crs.auth_service.entity.ApiKey;
import vn.edu.crs.auth_service.repository.ApiKeyRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ApiKeyService {

    private static final String ACTIVE = "ACTIVE";
    private static final String REVOKED = "REVOKED";

    private static final SecureRandom RANDOM =
            new SecureRandom();

    private final ApiKeyRepository apiKeyRepository;

    public ApiKeyResponseDTO create(
            ApiKeyCreateRequestDTO dto
    ) {

        ApiKey apiKey = new ApiKey();

        apiKey.setKeyValue(
                generateRandomKey()
        );

        apiKey.setOwnerName(
                dto.getOwnerName()
        );

        apiKey.setScopes(
                dto.getScopes()
        );

        apiKey.setStatus(
                ACTIVE
        );

        apiKey.setCreatedAt(
                LocalDateTime.now()
        );

        apiKey.setExpiresAt(
                dto.getValidDays() != null
                        ? LocalDateTime.now()
                            .plusDays(dto.getValidDays())
                        : null
        );

        ApiKey saved =
                apiKeyRepository.save(apiKey);

        return toDTO(saved);
    }

    public List<ApiKeyResponseDTO> getAll() {

        return apiKeyRepository
                .findAll()
                .stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    public void revoke(Long id) {

        ApiKey apiKey =
                apiKeyRepository
                        .findById(id)
                        .orElseThrow(
                                () ->
                                        new NoSuchElementException(
                                                "Khong tim thay API Key id = "
                                                        + id
                                        )
                        );

        apiKey.setStatus(
                REVOKED
        );

        apiKeyRepository.save(
                apiKey
        );
    }

    public boolean isValidForScope(
            String keyValue,
            String requiredScope
    ) {

        return apiKeyRepository
                .findByKeyValue(keyValue)

                // Key phải đang ACTIVE
                .filter(
                        key ->
                                ACTIVE.equals(
                                        key.getStatus()
                                )
                )

                // Chưa hết hạn
                .filter(
                        key ->
                                key.getExpiresAt() == null
                                        ||
                                        key.getExpiresAt()
                                                .isAfter(
                                                        LocalDateTime.now()
                                                )
                )

                // Phải có đúng scope yêu cầu
                .filter(
                        key ->
                                List.of(
                                        key.getScopes()
                                                .split(",")
                                )
                                .stream()
                                .map(String::trim)
                                .anyMatch(
                                        scope ->
                                                scope.equals(
                                                        requiredScope
                                                )
                                )
                )

                .isPresent();
    }

    private String generateRandomKey() {

        byte[] bytes =
                new byte[24];

        RANDOM.nextBytes(
                bytes
        );

        return "crs_"
                + Base64
                .getUrlEncoder()
                .withoutPadding()
                .encodeToString(bytes);
    }

    private ApiKeyResponseDTO toDTO(
            ApiKey apiKey
    ) {

        return new ApiKeyResponseDTO(
                apiKey.getId(),
                apiKey.getKeyValue(),
                apiKey.getOwnerName(),
                apiKey.getScopes(),
                apiKey.getStatus(),
                apiKey.getExpiresAt(),
                apiKey.getCreatedAt()
        );
    }
}
