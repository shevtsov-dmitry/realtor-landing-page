package ru.nshevtsova.reviews;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import org.apache.tomcat.util.http.parser.Priority;
import org.aspectj.weaver.bcel.ClassPathManager;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * ReviewServer
 */
@Service
public class ReviewService {

    @Autowired
    private ReviewRepo repo;

    @Value("${HOME}")
    private String HOME_FOLDER;

    public List<Review> listRecent(int amount) {
        final Pageable requestedAmountRestriction = PageRequest.of(0, amount);
        return repo.findRecentlyAdded(requestedAmountRestriction);
    }

    public Review addReview(Review review) {
        return repo.save(review);
    }

    public void saveUserPic(Long reviewId, MultipartFile userPic) throws IOException {
        File saveDir = new File(HOME_FOLDER + "/Pictures/realtor/images");
        if (!saveDir.exists()) {
            saveDir.mkdirs();
        }

        final Review review = repo.findById(reviewId).get();
        final String fileExtension = userPic.getOriginalFilename()
                .substring(userPic.getOriginalFilename().lastIndexOf(".") + 1);

        final File file = new File(
                "%s/%d-%s-%s.%s".formatted(
                        saveDir.getPath(),
                        reviewId,
                        review.getName(),
                        review.getSurname(),
                        fileExtension));

        userPic.transferTo(file);
    }

}
