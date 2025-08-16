package com.fiveOps.promptforge.S3Bucket.service;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.io.IOException;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectResponse;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectResponse;

@ExtendWith(MockitoExtension.class)
class S3ServiceTest {

    @Mock
    private S3Client s3Client;

    private S3Service s3Service;

    private static final String BUCKET_NAME = "test-bucket";
    private static final String TEST_FILE_NAME = "test-file.txt";
    private static final String TEST_CONTENT_TYPE = "text/plain";
    private static final String TEST_CONTENT = "Hello, World!";

    @BeforeEach
    void setUp() {
        s3Service = new S3Service(s3Client);
        ReflectionTestUtils.setField(s3Service, "bucketName", BUCKET_NAME);
    }

    @Test
    void uploadFile_Success() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            TEST_FILE_NAME, 
            TEST_CONTENT_TYPE, 
            TEST_CONTENT.getBytes()
        );

        PutObjectResponse putObjectResponse = PutObjectResponse.builder().build();
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(putObjectResponse);

        String result = s3Service.uploadFile(file);

        assertNotNull(result);
        assertTrue(result.startsWith("https://" + BUCKET_NAME + ".s3.amazonaws.com/"));
        assertTrue(result.endsWith("-" + TEST_FILE_NAME));

        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        ArgumentCaptor<RequestBody> bodyCaptor = ArgumentCaptor.forClass(RequestBody.class);
        
        verify(s3Client).putObject(requestCaptor.capture(), bodyCaptor.capture());
        
        PutObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals(TEST_CONTENT_TYPE, capturedRequest.contentType());
        assertTrue(capturedRequest.key().endsWith("-" + TEST_FILE_NAME));
    }

    @Test
    void uploadFile_WithNullContentType() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            TEST_FILE_NAME, 
            null, 
            TEST_CONTENT.getBytes()
        );

        PutObjectResponse putObjectResponse = PutObjectResponse.builder().build();
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(putObjectResponse);

        String result = s3Service.uploadFile(file);

        assertNotNull(result);
        assertTrue(result.startsWith("https://" + BUCKET_NAME + ".s3.amazonaws.com/"));
        
        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        
        PutObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertNull(capturedRequest.contentType());
        assertTrue(capturedRequest.key().endsWith("-" + TEST_FILE_NAME));
    }

    @Test
    void uploadFile_WithEmptyFileName() throws IOException {
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "", 
            TEST_CONTENT_TYPE, 
            TEST_CONTENT.getBytes()
        );

        PutObjectResponse putObjectResponse = PutObjectResponse.builder().build();
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(putObjectResponse);

        String result = s3Service.uploadFile(file);

        assertNotNull(result);
        assertTrue(result.startsWith("https://" + BUCKET_NAME + ".s3.amazonaws.com/"));
        assertTrue(result.endsWith("-"));
        
        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        
        PutObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertTrue(capturedRequest.key().endsWith("-"));
    }

    @Test
    void uploadFile_WithLargeFile() throws IOException {
        byte[] largeContent = new byte[1024 * 1024]; // 1MB
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            "large-file.bin", 
            "application/octet-stream", 
            largeContent
        );

        PutObjectResponse putObjectResponse = PutObjectResponse.builder().build();
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(putObjectResponse);

        String result = s3Service.uploadFile(file);

        assertNotNull(result);
        assertTrue(result.startsWith("https://" + BUCKET_NAME + ".s3.amazonaws.com/"));
        
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void deleteFile_Success() {
        String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/test-file-key.txt";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("test-file-key.txt", capturedRequest.key());
    }

    @Test
    void deleteFile_WithComplexKey() {
        String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/folder/subfolder/complex-file-name-123.txt";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("complex-file-name-123.txt", capturedRequest.key());
    }

    @Test
    void deleteFile_WithNullUrl() {
        s3Service.deleteFile(null);

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void deleteFile_WithEmptyUrl() {
        s3Service.deleteFile("");

        verify(s3Client, never()).deleteObject(any(DeleteObjectRequest.class));
    }

    @Test
    void deleteFile_WithUrlWithoutSlash() {
        String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("test-bucket.s3.amazonaws.com", capturedRequest.key());
    }

    @Test
    void deleteFile_WithDifferentBucketInUrl() {
        String fileUrl = "https://different-bucket.s3.amazonaws.com/test-file.txt";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("test-file.txt", capturedRequest.key());
    }

    @Test
    void deleteFile_WithUrlContainingQueryParameters() {
        String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/test-file.txt?versionId=123&expires=456";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("test-file.txt?versionId=123&expires=456", capturedRequest.key());
    }

    @Test
    void deleteFile_WithUrlContainingFragments() {
        String fileUrl = "https://" + BUCKET_NAME + ".s3.amazonaws.com/test-file.txt#section";
        DeleteObjectResponse deleteObjectResponse = DeleteObjectResponse.builder().build();
        
        when(s3Client.deleteObject(any(DeleteObjectRequest.class)))
            .thenReturn(deleteObjectResponse);

        s3Service.deleteFile(fileUrl);

        ArgumentCaptor<DeleteObjectRequest> requestCaptor = ArgumentCaptor.forClass(DeleteObjectRequest.class);
        verify(s3Client).deleteObject(requestCaptor.capture());
        
        DeleteObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertEquals("test-file.txt#section", capturedRequest.key());
    }

    @Test
    void constructor_InitializesS3Client() {
        S3Service newService = new S3Service(s3Client);

        assertNotNull(newService);
        assertDoesNotThrow(() -> newService);
    }

    @Test
    void uploadFile_WithSpecialCharactersInFileName() throws IOException {
        String fileNameWithSpecialChars = "test-file with spaces & symbols (1).txt";
        MockMultipartFile file = new MockMultipartFile(
            "file", 
            fileNameWithSpecialChars, 
            TEST_CONTENT_TYPE, 
            TEST_CONTENT.getBytes()
        );

        PutObjectResponse putObjectResponse = PutObjectResponse.builder().build();
        when(s3Client.putObject(any(PutObjectRequest.class), any(RequestBody.class)))
            .thenReturn(putObjectResponse);

        String result = s3Service.uploadFile(file);

        assertNotNull(result);
        assertTrue(result.startsWith("https://" + BUCKET_NAME + ".s3.amazonaws.com/"));
        assertTrue(result.endsWith("-" + fileNameWithSpecialChars));
        
        ArgumentCaptor<PutObjectRequest> requestCaptor = ArgumentCaptor.forClass(PutObjectRequest.class);
        verify(s3Client).putObject(requestCaptor.capture(), any(RequestBody.class));
        
        PutObjectRequest capturedRequest = requestCaptor.getValue();
        assertEquals(BUCKET_NAME, capturedRequest.bucket());
        assertTrue(capturedRequest.key().endsWith("-" + fileNameWithSpecialChars));
    }
}
