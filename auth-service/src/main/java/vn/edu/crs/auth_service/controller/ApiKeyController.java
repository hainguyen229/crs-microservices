package vn.edu.crs.auth_service.controller;

import vn.edu.crs.auth_service.dto.ApiKeyCreateRequestDTO;
import vn.edu.crs.auth_service.dto.ApiKeyResponseDTO;
import vn.edu.crs.auth_service.service.ApiKeyService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api-keys")
@RequiredArgsConstructor
public class ApiKeyController {

    private final ApiKeyService apiKeyService;

    // Lay danh sach API Key
    @GetMapping
    public List<ApiKeyResponseDTO> getAll() {
        return apiKeyService.getAll();
    }

    // Cap API Key moi
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiKeyResponseDTO create(
            @Valid @RequestBody ApiKeyCreateRequestDTO dto
    ) {
        return apiKeyService.create(dto);
    }

    // Thu hoi API Key
    @DeleteMapping("/{id}")
    public void revoke(
            @PathVariable Long id
    ) {
        apiKeyService.revoke(id);
    }
}
