package com.fiveOps.promptforge.S3Bucket.service;

import java.io.IOException;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import software.amazon.awssdk.awscore.exception.AwsServiceException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
public class S3Service {

  private final S3Client s3Client;

  @Value("${aws.s3.bucket-name}")
  private String bucketName;

  public S3Service(S3Client s3Client) {
    this.s3Client = s3Client;
  }

  public String uploadFile(MultipartFile file) throws IOException {
    String fileName = UUID.randomUUID() + "-" + file.getOriginalFilename();

    PutObjectRequest putRequest =
        PutObjectRequest.builder()
            .bucket(bucketName)
            .key(fileName)
            .contentType(file.getContentType())
            .build(); // ✅ no ACL

    s3Client.putObject(putRequest, RequestBody.fromBytes(file.getBytes()));

    return "https://" + bucketName + ".s3.amazonaws.com/" + fileName;
  }

  public void deleteFile(String fileUrl) {
    if (fileUrl == null || fileUrl.isEmpty()) return;

    String key = fileUrl.substring(fileUrl.lastIndexOf("/") + 1);

    try {
      DeleteObjectRequest deleteRequest =
          DeleteObjectRequest.builder().bucket(bucketName).key(key).build();
      s3Client.deleteObject(deleteRequest);
    } catch (AwsServiceException e) {
      e.printStackTrace(); // handle more robustly in production
    }
  }
}
