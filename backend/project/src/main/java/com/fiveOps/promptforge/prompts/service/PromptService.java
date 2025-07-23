package com.fiveOps.promptforge.prompts.service;

import java.util.ArrayList;
import java.util.List;
// import java.util.Map;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.fiveOps.promptforge.prompts.model.Prompt;
import com.fiveOps.promptforge.prompts.model.PromptWithSourceDTO;
import com.fiveOps.promptforge.prompts.repository.PromptRepository;

@Service
public class PromptService {
  private final PromptRepository promptRepository;
  private final TagService tagService;

  public PromptService(PromptRepository promptRepository, TagService tagService) {
    this.promptRepository = promptRepository;
    this.tagService = tagService;
  }

  public List<Prompt> getAllPrompts() {
    return promptRepository.findAll();
  }

  public Page<PromptWithSourceDTO> getPromptsByAuthor(UUID authorId,Pageable pageable) {
    int offset = (int)pageable.getPageNumber()-1*pageable.getPageSize();
    List<PromptWithSourceDTO> prompts = promptRepository.findByAuthorIdAndOptionalTagName(authorId,null,
      pageable.getPageSize(),offset);

    long totalElements = promptRepository.countAuthoredPrompts(authorId);
    return new PageImpl<>(prompts, pageable, totalElements);
  }

  public Prompt getPromptById(UUID id) {
    return promptRepository.findById(id).orElse(null);
  }

  @Transactional
  public Prompt createPrompt(Prompt prompt) {
    prompt.setVisibility("private");
    if (prompt.getPrice() == null) {
      prompt.setPrice(0.0);
    }

    prompt.resolveAndSetTags(tagService);
    return promptRepository.save(prompt);
  }

  public List<Prompt> getPromptsByTagName(String tagName) {
    // Delegate tag lookup to TagService
    UUID tagId = tagService.getTagIdByName(tagName);
    return promptRepository.findByTagId(tagId);
  }

  @Transactional
  public Prompt updatePrompt(UUID id, Prompt promptDetails) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              prompt.setTitle(promptDetails.getTitle());
              prompt.setSlug(promptDetails.getSlug());
              prompt.setContent(promptDetails.getContent());
              prompt.setDescription(promptDetails.getDescription());
              prompt.setPrice(promptDetails.getPrice());
              prompt.setTagIds(promptDetails.getTagIds());
              // visibility can only be updated through publish/unpublish
              return promptRepository.save(prompt);
            })
        .orElse(null);
  }

  @Transactional
  public Prompt publishPrompt(UUID id) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              prompt.setVisibility("public");
              prompt.setPublishedAt(java.time.LocalDateTime.now());
              return promptRepository.save(prompt);
            })
        .orElse(null);
  }

  @Transactional
  public Prompt unpublishPrompt(UUID id) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              prompt.setVisibility("private");
              return promptRepository.save(prompt);
            })
        .orElse(null);
  }

  @Transactional
  public boolean deletePrompt(UUID id) {
    return promptRepository
        .findById(id)
        .map(
            prompt -> {
              promptRepository.delete(prompt);
              return true;
            })
        .orElse(false);
  }

  public List<Prompt> searchByTitle(String searchTerm) {
    return promptRepository.findByTitleContainingIgnoreCase(searchTerm);
  }

  public List<Prompt> searchPublicByTitle(String searchTerm) {
    return promptRepository.searchPublicByTitle(searchTerm);
  }


  public Page<PromptWithSourceDTO> getPurchasedPromptsByOptionalTag
  (UUID userId, String tagName, Pageable pageable) {
    UUID tagId = null;

    if (tagName != null) {
      tagId = tagService.getTagIdByName(tagName);
    }
    List<PromptWithSourceDTO> prompts = promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(
      userId, tagId,pageable.getPageSize(),(int)pageable.getOffset());
    long totalElements = promptRepository.countPurchasedPromptsByOptionalTagName(userId,tagId);  //thissssssssssssssss
    return new PageImpl<>(prompts,pageable,totalElements);
  }
  

  public Page<PromptWithSourceDTO> getAuthoredAndPurchasedPromptsByOptionalTagID
  (UUID userId,String tagName, Pageable pageable) {
    UUID tagId = null;
    
    if (tagName != null) {
      tagId=tagService.getTagIdByName(tagName);
    }

    int pageSize = pageable.getPageSize();
    int offset = (int) pageable.getOffset();

    long totalPurchased = promptRepository.countPurchasedPromptsByOptionalTagName(userId,tagId); //thisssssssssssssssssssssssssssss
    long totalAuthored = promptRepository.countByAuthoredAndTags(userId,tagId);
    long totalElements = totalPurchased + totalAuthored;


    System.out.println("\n\n///////////////////////////page:"+ pageable.getPageNumber());
    System.out.println("totalPurchased:"+ totalPurchased);
    System.out.println("totalAuthored:"+ totalAuthored);
    System.out.println("totalElements:"+ totalElements);

    List<PromptWithSourceDTO> combined = new ArrayList<>();

    if (offset < totalPurchased) {
      System.out.println("offset < totalPurchased");
      int purchasedLimit = Math.min(pageSize, (int) (totalPurchased - offset));
      List<PromptWithSourceDTO> purchasedPrompts =
      promptRepository.getPurchasedPromptsByUserIdAndOptionalTag(userId, tagId, purchasedLimit, offset);
      combined.addAll(purchasedPrompts);

      int remaining = pageSize - purchasedPrompts.size();
      if (remaining > 0) {
        System.out.println("remaining > 0");
        /*start authored prompts from 0 if the end of purchased prompts is reached 
        and dont add up to the limit*/
        List<PromptWithSourceDTO> authoredPrompts =
          promptRepository.findByAuthorIdAndOptionalTagName(userId, tagId, remaining, 0); //thisssssssss2
        combined.addAll(authoredPrompts);

        System.out.println("authoredPrompts size:"+ authoredPrompts.size());
      }
    } 
    else {//purchased prompts exhausted; fetch authored prompts only
      System.out.println("elseeeeeeeeeeeeeee");
      int authoredOffset = (int) (offset - totalPurchased);
      List<PromptWithSourceDTO> authoredPrompts =
        promptRepository.findByAuthorIdAndOptionalTagName(userId, tagId, pageSize, authoredOffset); ////thisssssssss2
      combined.addAll(authoredPrompts);
    }
    System.out.println("combined.size():"+ combined.size());
    return new PageImpl<>(combined, pageable, totalElements);
  }

  // public Page<PromptWithSourceDTO> getRecentAuthoredAndPurchasedPromptsByOptionalTag(UUID userId, String tagName, Pageable pageable){


  // }

  public Page<PromptWithSourceDTO> getAuthoredAndPurchasedPromptsByFilter(UUID userId, String tagName,
   String filter, Pageable pageable) throws RuntimeException{
    UUID tagId = null;
    if (tagName!=null) {
      tagId = tagService.getTagIdByName(tagName);
    }

    System.out.println("\n\n"+filter+" == purchased");


    // if(filter == "favorites")
    //   return getFavouritePrompts(userId, pageable);

    // if(filter == "recent")
    //   return getRecentAuthoredAndPurchasedPromptsByOptionalTag(userId, tagName, pageable);
    
    // if(filter == "popular")
    //   return getPopularAuthoredAndPurchasedPrompts(userId, pageable);

    
    if(filter.equals("public") || filter.equals("private"))
      return promptRepository.findByAuthorIdAndVisibilityAndOptionalTag(userId,tagId,filter,pageable);
    
    if (filter.equals("purchased"))
      return getPurchasedPromptsByOptionalTag(userId, tagName, pageable);
    // if(filter == "purchased")
    //   return getPurchasedPromptsByOptionalTag(userId, tagName, pageable);

    System.out.println("\n\n//invaliddddddddddddddd filterrrrrrrrrrrrrrrrrrrrrrrrrrrr:" + filter);

    throw new RuntimeException("invalid filter");


    // long totalPurchased = promptRepository.countPurchasedPromptsByTagName(userId,tagId);
    // long totalAuthored = promptRepository.countByAuthoredAndTags(userId,tagId);
    // long totalElements = totalPurchased + totalAuthored;

    // List<PromptWithSourceDTO> combined = new ArrayList<>();

    // if (offset < totalPurchased) {
    //   int purchasedLimit = Math.min(pageSize, (int) (totalPurchased - offset));
    //   List<PromptWithSourceDTO> purchasedPrompts =
    //   promptRepository.getPurchasedPromptsByUserIdAndTagName(userId, tagId, purchasedLimit, offset);
    //   combined.addAll(purchasedPrompts);

    //   int remaining = pageSize - purchasedPrompts.size();
    //   if (remaining > 0) {
    //     /*start authored prompts from 0 if the end of purchased prompts is reached 
    //     and dont add up to the limit*/
    //     List<PromptWithSourceDTO> authoredPrompts =
    //       promptRepository.findByAuthorIdAndByTagName(userId, tagId, remaining, 0);
    //     combined.addAll(authoredPrompts);
    //   }
    // } 
    // else {//purchased prompts exhausted; fetch authored prompts only
    //   int authoredOffset = (int) (offset - totalPurchased);
    //   List<PromptWithSourceDTO> authoredPrompts =
    //     promptRepository.findByAuthorIdAndByTagName(userId, tagId, pageSize, authoredOffset);
    //   combined.addAll(authoredPrompts);
    // }

    // return new PageImpl<>(combined, pageable, totalElements);
  }
}

